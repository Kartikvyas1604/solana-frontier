import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { ProofService } from '../../modules/proof/proof.service';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const connection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const proofService = new ProofService();

export const proofWorker = new Worker(
  'proof',
  async (job: Job) => {
    const { hedgePositionId } = job.data;

    try {
      const proofId = await proofService.generateProof(hedgePositionId);
      return { success: true, proofId };
    } catch (error: any) {
      logger.error({ error, hedgePositionId }, 'Proof generation failed');
      throw error;
    }
  },
  { connection }
);

proofWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Proof job completed');
});

proofWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Proof job failed');
});
