import { ConsensusService } from '../modules/price/consensus.service';
import { logger } from '../utils/logger';

const consensusService = new ConsensusService();

async function monitorPrices(): Promise<void> {
  logger.info('Price monitor worker started');

  setInterval(async () => {
    try {
      await consensusService.getCurrentPrice();
    } catch (error) {
      logger.error({ error }, 'Price monitoring failed');
    }
  }, 2000);

  setInterval(async () => {
    try {
      await consensusService.flushToDatabase();
    } catch (error) {
      logger.error({ error }, 'Price flush to database failed');
    }
  }, 300000);
}

monitorPrices().catch((error) => {
  logger.error({ error }, 'Price monitor worker crashed');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('Price monitor worker shutting down');
  await consensusService.disconnect();
  process.exit(0);
});
