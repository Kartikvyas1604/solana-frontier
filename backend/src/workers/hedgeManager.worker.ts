import { hedgeWorker } from '../queues/processors/hedge.processor';
import { logger } from '../utils/logger';

logger.info('Hedge manager worker started');

process.on('SIGTERM', async () => {
  logger.info('Hedge manager worker shutting down');
  await hedgeWorker.close();
  process.exit(0);
});
