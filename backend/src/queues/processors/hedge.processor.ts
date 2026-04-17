import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { HedgeService } from '../../modules/hedge/hedge.service';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const connection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const hedgeService = new HedgeService();

export const hedgeWorker = new Worker(
  'hedge',
  async (job: Job) => {
    const { action, walletAddress, hedgePositionId, reason } = job.data;

    try {
      if (action === 'open') {
        const result = await hedgeService.openHedge(walletAddress);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
        return { success: true, hedgePositionId: result.value };
      } else if (action === 'close') {
        const result = await hedgeService.closeHedge(hedgePositionId, reason);
        if (!result.ok) {
          throw new Error(result.error.message);
        }
        return { success: true };
      }
    } catch (error: any) {
      logger.error({ error, job: job.data }, 'Hedge job failed');
      throw error;
    }
  },
  { connection }
);

hedgeWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Hedge job completed');
});

hedgeWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Hedge job failed');
});
