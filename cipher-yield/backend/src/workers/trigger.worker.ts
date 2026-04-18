import { Queue, Worker, Job } from 'bullmq';
import { redis, redisSub } from '../config/redis.js';
import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { calculateDrawdown } from '../utils/math.js';
import { priceService } from '../services/price.service.js';
import { env } from '../config/env.js';

const TRIGGER_QUEUE_NAME = 'trigger-evaluation';
const LOCK_KEY = 'trigger:lock';
const LOCK_TTL = 10;

interface TriggerJobData {
  vaultId: string;
  currentPrice: bigint;
  timestamp: number;
}

export const triggerQueue = new Queue(TRIGGER_QUEUE_NAME, {
  connection: redis,
});

export const triggerWorker = new Worker(
  TRIGGER_QUEUE_NAME,
  async (job: Job<TriggerJobData>) => {
    const startTime = Date.now();
    const { vaultId, currentPrice, timestamp } = job.data;

    const lockAcquired = await redis.set(LOCK_KEY, '1', 'EX', LOCK_TTL, 'NX');
    if (!lockAcquired) {
      logger.debug('Trigger evaluation skipped - lock held');
      return { skipped: true };
    }

    try {
      const vault = await prisma.vault.findUnique({
        where: { id: vaultId },
        include: { userPositions: true },
      });

      if (!vault) {
        throw new Error(`Vault ${vaultId} not found`);
      }

      const drawdown = calculateDrawdown(vault.peakNav, vault.currentNav);
      const volatility = await priceService.getVolatility(30);

      const evaluations = [];

      for (const position of vault.userPositions) {
        const evaluation = await evaluateTriggers(
          vault,
          position,
          currentPrice,
          drawdown,
          volatility
        );

        if (evaluation.triggered) {
          evaluations.push({
            userId: position.walletAddress,
            triggerType: evaluation.triggerType,
            action: evaluation.action,
          });

          await prisma.executionLog.create({
            data: {
              vaultId: vault.id,
              type: evaluation.action === 'HEDGE_OPEN' ? 'HEDGE_OPEN' : 'HEDGE_CLOSE',
              triggerType: evaluation.triggerType,
              priceAtExecution: currentPrice,
              status: 'EVALUATED',
            },
          });
        }
      }

      const duration = Date.now() - startTime;

      if (duration > 200) {
        logger.warn({ duration }, 'Trigger evaluation exceeded 200ms');
      }

      return { evaluations, duration };
    } finally {
      await redis.del(LOCK_KEY);
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

async function evaluateTriggers(
  vault: any,
  position: any,
  currentPrice: bigint,
  drawdown: number,
  volatility: number
): Promise<{
  triggered: boolean;
  triggerType?: string;
  action?: string;
}> {
  const HIGH_VOL_THRESHOLD = 0.05;

  if (drawdown >= 0.1 && !vault.activeHedge) {
    return {
      triggered: true,
      triggerType: 'DRAWDOWN',
      action: 'HEDGE_OPEN',
    };
  }

  if (volatility > HIGH_VOL_THRESHOLD && !vault.activeHedge) {
    return {
      triggered: true,
      triggerType: 'VOLATILITY',
      action: 'HEDGE_OPEN',
    };
  }

  if (vault.activeHedge) {
    const hedgePosition = await prisma.hedgePosition.findFirst({
      where: { vaultId: vault.id, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });

    if (hedgePosition) {
      const hedgeDuration = Date.now() - hedgePosition.openedAt.getTime();
      const maxDuration = 24 * 60 * 60 * 1000;

      if (hedgeDuration > maxDuration) {
        return {
          triggered: true,
          triggerType: 'TIME',
          action: 'HEDGE_CLOSE',
        };
      }

      const recovery = Number(currentPrice - hedgePosition.entryPrice) / Number(hedgePosition.entryPrice);
      if (recovery > 0.05) {
        return {
          triggered: true,
          triggerType: 'RECOVERY',
          action: 'HEDGE_CLOSE',
        };
      }
    }
  }

  return { triggered: false };
}

export async function startTriggerEvaluation() {
  redisSub.subscribe('price:SOL:USDC', (err) => {
    if (err) {
      logger.error({ err }, 'Failed to subscribe to price channel');
      return;
    }
    logger.info('Subscribed to price updates for trigger evaluation');
  });

  redisSub.on('message', async (channel, message) => {
    if (channel === 'price:SOL:USDC') {
      const { price, timestamp } = JSON.parse(message);

      const vaults = await prisma.vault.findMany();

      for (const vault of vaults) {
        await triggerQueue.add(
          'evaluate',
          {
            vaultId: vault.id,
            currentPrice: BigInt(price),
            timestamp,
          },
          {
            removeOnComplete: 100,
            removeOnFail: 50,
          }
        );
      }
    }
  });
}

triggerWorker.on('completed', (job) => {
  logger.debug({ jobId: job.id, result: job.returnvalue }, 'Trigger evaluation completed');
});

triggerWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Trigger evaluation failed');
});
