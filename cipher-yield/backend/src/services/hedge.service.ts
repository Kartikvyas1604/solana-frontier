import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { teeService } from '../services/tee.service.js';
import { operatorService } from '../services/operator.service.js';
import { priceService } from '../services/price.service.js';
import { connection, confirmTransaction, vaultAddress } from '../config/solana.js';
import { env } from '../config/env.js';
import { applySlippage } from '../utils/math.js';
import { redisPub } from '../config/redis.js';

const EXECUTION_QUEUE_NAME = 'hedge-execution';

interface HedgeOpenJobData {
  vaultId: string;
  executionLogId: string;
  triggerType: string;
}

export const executionQueue = new Queue(EXECUTION_QUEUE_NAME, {
  connection: redis,
});

export const executionWorker = new Worker(
  EXECUTION_QUEUE_NAME,
  async (job: Job<HedgeOpenJobData>) => {
    const startTime = Date.now();
    const { vaultId, executionLogId, triggerType } = job.data;

    try {
      await prisma.executionLog.update({
        where: { id: executionLogId },
        data: { status: 'EXECUTING' },
      });

      const vault = await prisma.vault.findUnique({
        where: { id: vaultId },
      });

      if (!vault) {
        throw new Error(`Vault ${vaultId} not found`);
      }

      const priceResult = await priceService.getConsensusPrice();

      if (priceService.isPriceStale()) {
        throw new Error('Price data is stale');
      }

      const enclaveResponse = await teeService.evaluateStrategy('encrypted_strategy_placeholder', {
        currentNav: vault.currentNav,
        peakNav: vault.peakNav,
        activeHedge: vault.activeHedge,
        currentPrice: priceResult.consensus,
      });

      const executionData = {
        vaultAddress: vault.address,
        action: enclaveResponse.executionIntent.action,
        size: enclaveResponse.executionIntent.size.toString(),
        targetPrice: enclaveResponse.executionIntent.targetPrice.toString(),
        timestamp: Date.now(),
      };

      const multiSigValidation = await operatorService.collectSignatures(executionData, 2);

      if (!multiSigValidation.isValid) {
        throw new Error('Insufficient operator signatures');
      }

      const slippagePrice = applySlippage(
        priceResult.consensus,
        env.MAX_SLIPPAGE_BPS,
        'sell'
      );

      const driftPositionId = await openDriftPosition(
        enclaveResponse.executionIntent.size,
        slippagePrice
      );

      await prisma.hedgePosition.create({
        data: {
          vaultId: vault.id,
          size: enclaveResponse.executionIntent.size,
          entryPrice: priceResult.consensus,
          status: 'OPEN',
          driftPositionId,
        },
      });

      await prisma.vault.update({
        where: { id: vault.id },
        data: { activeHedge: true },
      });

      for (const sig of multiSigValidation.signatures) {
        await prisma.operatorValidation.create({
          data: {
            executionLogId,
            operatorIndex: sig.operatorIndex,
            signature: sig.signature,
          },
        });
      }

      await prisma.executionLog.update({
        where: { id: executionLogId },
        data: {
          status: 'COMPLETED',
          priceAtExecution: priceResult.consensus,
        },
      });

      await redisPub.publish('vault:events', JSON.stringify({
        event: 'hedge_opened',
        vaultId: vault.id,
        size: enclaveResponse.executionIntent.size.toString(),
        price: priceResult.consensus.toString(),
        timestamp: Date.now(),
      }));

      const duration = Date.now() - startTime;
      logger.info({ vaultId, duration, driftPositionId }, 'Hedge opened successfully');

      return { success: true, duration, driftPositionId };
    } catch (error) {
      logger.error({ error, vaultId }, 'Hedge execution failed');

      await prisma.executionLog.update({
        where: { id: executionLogId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

async function openDriftPosition(size: bigint, maxPrice: bigint): Promise<string> {
  logger.info({ size: size.toString(), maxPrice: maxPrice.toString() }, 'Opening Drift position');

  const mockPositionId = `drift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return mockPositionId;
}

async function closeDriftPosition(positionId: string): Promise<bigint> {
  logger.info({ positionId }, 'Closing Drift position');

  const mockPnl = BigInt(Math.floor(Math.random() * 1000000));

  return mockPnl;
}

export class HedgeService {
  async openHedge(vaultId: string, triggerType: string): Promise<string> {
    const executionLog = await prisma.executionLog.create({
      data: {
        vaultId,
        type: 'HEDGE_OPEN',
        triggerType,
        status: 'PENDING',
      },
    });

    await executionQueue.add(
      'open-hedge',
      {
        vaultId,
        executionLogId: executionLog.id,
        triggerType,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    return executionLog.id;
  }

  async closeHedge(vaultId: string): Promise<string> {
    const vault = await prisma.vault.findUnique({
      where: { id: vaultId },
    });

    if (!vault || !vault.activeHedge) {
      throw new Error('No active hedge to close');
    }

    const hedgePosition = await prisma.hedgePosition.findFirst({
      where: { vaultId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });

    if (!hedgePosition) {
      throw new Error('Active hedge position not found');
    }

    const pnl = await closeDriftPosition(hedgePosition.driftPositionId!);

    await prisma.hedgePosition.update({
      where: { id: hedgePosition.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        pnl,
      },
    });

    await prisma.vault.update({
      where: { id: vaultId },
      data: { activeHedge: false },
    });

    const executionLog = await prisma.executionLog.create({
      data: {
        vaultId,
        type: 'HEDGE_CLOSE',
        status: 'COMPLETED',
      },
    });

    await redisPub.publish('vault:events', JSON.stringify({
      event: 'hedge_closed',
      vaultId,
      pnl: pnl.toString(),
      timestamp: Date.now(),
    }));

    logger.info({ vaultId, pnl: pnl.toString() }, 'Hedge closed successfully');

    return executionLog.id;
  }
}

export const hedgeService = new HedgeService();

executionWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Hedge execution completed');
});

executionWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Hedge execution failed');
});
