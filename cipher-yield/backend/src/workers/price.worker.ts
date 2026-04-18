import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { priceService } from '../services/price.service.js';
import { logger } from '../utils/logger.js';

const PRICE_QUEUE_NAME = 'price-updates';

export const priceQueue = new Queue(PRICE_QUEUE_NAME, {
  connection: redis,
});

export const priceWorker = new Worker(
  PRICE_QUEUE_NAME,
  async (job: Job) => {
    const startTime = Date.now();

    try {
      const result = await priceService.getConsensusPrice();

      await priceService.storePriceSnapshot(result);
      await priceService.publishPrice(result);

      const duration = Date.now() - startTime;

      if (duration > 200) {
        logger.warn({ duration }, 'Price update took longer than 200ms');
      }

      return { success: true, price: result.consensus.toString(), duration };
    } catch (error) {
      logger.error({ error }, 'Price worker failed');
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 1,
    limiter: {
      max: 2,
      duration: 1000,
    },
  }
);

priceWorker.on('completed', (job) => {
  logger.debug({ jobId: job.id, result: job.returnvalue }, 'Price update completed');
});

priceWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Price update failed');
});

export async function startPricePolling() {
  await priceQueue.add(
    'poll-price',
    {},
    {
      repeat: {
        every: 500,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );
  logger.info('Price polling started (500ms interval)');
}
