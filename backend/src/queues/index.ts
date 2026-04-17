import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../config';

const connection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const hedgeQueue = new Queue('hedge', { connection });
export const proofQueue = new Queue('proof', { connection });

export async function closeQueues(): Promise<void> {
  await hedgeQueue.close();
  await proofQueue.close();
  await connection.quit();
}
