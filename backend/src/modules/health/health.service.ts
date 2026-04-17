import { prisma } from '../../db/client';
import { redis } from '../../queues';
import { Connection } from '@solana/web3.js';
import { config } from '../../config';
import { logger } from '../../utils/logger';

interface HealthCheck {
  healthy: boolean;
  timestamp: string;
  services: {
    database: boolean;
    redis: boolean;
    solana: boolean;
    drift?: boolean;
  };
  errors?: string[];
}

interface DetailedHealth extends HealthCheck {
  details: {
    database: { latency: number; connected: boolean };
    redis: { latency: number; connected: boolean };
    solana: { latency: number; slot: number; blockHeight: number };
    workers: {
      priceMonitor: { lastRun: string | null; status: string };
      triggerEvaluator: { lastRun: string | null; status: string };
      hedgeManager: { lastRun: string | null; status: string };
    };
  };
}

interface Metrics {
  timestamp: string;
  vault: {
    totalDeposits: number;
    totalWithdrawals: number;
    activePositions: number;
    totalUsers: number;
  };
  hedges: {
    totalOpened: number;
    totalClosed: number;
    activeHedges: number;
    totalPnl: number;
    totalFundingPaid: number;
  };
  policies: {
    active: number;
    triggered: number;
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

class HealthService {
  private connection: Connection;
  private startTime: number;

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
    this.startTime = Date.now();
  }

  async getHealth(): Promise<HealthCheck> {
    const errors: string[] = [];
    const services = {
      database: false,
      redis: false,
      solana: false,
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      services.database = true;
    } catch (error) {
      errors.push('Database connection failed');
      logger.error('Database health check failed', { error });
    }

    try {
      await redis.ping();
      services.redis = true;
    } catch (error) {
      errors.push('Redis connection failed');
      logger.error('Redis health check failed', { error });
    }

    try {
      await this.connection.getSlot();
      services.solana = true;
    } catch (error) {
      errors.push('Solana RPC connection failed');
      logger.error('Solana health check failed', { error });
    }

    const healthy = services.database && services.redis && services.solana;

    return {
      healthy,
      timestamp: new Date().toISOString(),
      services,
      ...(errors.length > 0 && { errors }),
    };
  }

  async getDetailedHealth(): Promise<DetailedHealth> {
    const basicHealth = await this.getHealth();
    const details: DetailedHealth['details'] = {
      database: { latency: 0, connected: false },
      redis: { latency: 0, connected: false },
      solana: { latency: 0, slot: 0, blockHeight: 0 },
      workers: {
        priceMonitor: { lastRun: null, status: 'unknown' },
        triggerEvaluator: { lastRun: null, status: 'unknown' },
        hedgeManager: { lastRun: null, status: 'unknown' },
      },
    };

    // Database latency
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      details.database.latency = Date.now() - start;
      details.database.connected = true;
    } catch (error) {
      logger.error('Database detailed check failed', { error });
    }

    // Redis latency
    try {
      const start = Date.now();
      await redis.ping();
      details.redis.latency = Date.now() - start;
      details.redis.connected = true;
    } catch (error) {
      logger.error('Redis detailed check failed', { error });
    }

    // Solana details
    try {
      const start = Date.now();
      const [slot, blockHeight] = await Promise.all([
        this.connection.getSlot(),
        this.connection.getBlockHeight(),
      ]);
      details.solana.latency = Date.now() - start;
      details.solana.slot = slot;
      details.solana.blockHeight = blockHeight;
    } catch (error) {
      logger.error('Solana detailed check failed', { error });
    }

    // Worker status from Redis
    try {
      const priceMonitor = await redis.get('worker:priceMonitor:lastRun');
      const triggerEvaluator = await redis.get('worker:triggerEvaluator:lastRun');
      const hedgeManager = await redis.get('worker:hedgeManager:lastRun');

      details.workers.priceMonitor.lastRun = priceMonitor;
      details.workers.priceMonitor.status = this.getWorkerStatus(priceMonitor);

      details.workers.triggerEvaluator.lastRun = triggerEvaluator;
      details.workers.triggerEvaluator.status = this.getWorkerStatus(triggerEvaluator);

      details.workers.hedgeManager.lastRun = hedgeManager;
      details.workers.hedgeManager.status = this.getWorkerStatus(hedgeManager);
    } catch (error) {
      logger.error('Worker status check failed', { error });
    }

    return {
      ...basicHealth,
      details,
    };
  }

  async getMetrics(): Promise<Metrics> {
    const vault = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      activePositions: 0,
      totalUsers: 0,
    };

    const hedges = {
      totalOpened: 0,
      totalClosed: 0,
      activeHedges: 0,
      totalPnl: 0,
      totalFundingPaid: 0,
    };

    const policies = {
      active: 0,
      triggered: 0,
    };

    try {
      // Vault metrics
      const [deposits, withdrawals, users] = await Promise.all([
        prisma.vaultPosition.count({ where: { status: 'ACTIVE' } }),
        prisma.vaultPosition.count({ where: { status: 'WITHDRAWN' } }),
        prisma.user.count(),
      ]);

      vault.totalDeposits = deposits;
      vault.totalWithdrawals = withdrawals;
      vault.activePositions = deposits;
      vault.totalUsers = users;

      // Hedge metrics
      const [openHedges, closedHedges, hedgeStats] = await Promise.all([
        prisma.hedgePosition.count({ where: { status: 'OPEN' } }),
        prisma.hedgePosition.count({ where: { status: 'CLOSED' } }),
        prisma.hedgePosition.aggregate({
          _sum: {
            realizedPnl: true,
            fundingPaidTotal: true,
          },
        }),
      ]);

      hedges.totalOpened = openHedges + closedHedges;
      hedges.totalClosed = closedHedges;
      hedges.activeHedges = openHedges;
      hedges.totalPnl = hedgeStats._sum.realizedPnl || 0;
      hedges.totalFundingPaid = hedgeStats._sum.fundingPaidTotal || 0;

      // Policy metrics
      const [activePolicies, triggeredPolicies] = await Promise.all([
        prisma.protectionRule.count({ where: { status: 'ACTIVE' } }),
        prisma.protectionRule.count({ where: { status: 'TRIGGERED' } }),
      ]);

      policies.active = activePolicies;
      policies.triggered = triggeredPolicies;
    } catch (error) {
      logger.error('Failed to fetch metrics', { error });
    }

    return {
      timestamp: new Date().toISOString(),
      vault,
      hedges,
      policies,
      system: {
        uptime: Date.now() - this.startTime,
        memoryUsage: process.memoryUsage(),
      },
    };
  }

  private getWorkerStatus(lastRun: string | null): string {
    if (!lastRun) return 'never_run';

    const lastRunTime = new Date(lastRun).getTime();
    const now = Date.now();
    const diff = now - lastRunTime;

    if (diff < 60000) return 'healthy'; // Less than 1 minute
    if (diff < 300000) return 'warning'; // Less than 5 minutes
    return 'stale'; // More than 5 minutes
  }
}

export const healthService = new HealthService();
