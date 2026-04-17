import { prisma } from '../db/client';
import { hedgeQueue } from '../queues';
import { logger } from '../utils/logger';

async function checkStuckHedges(): Promise<void> {
  logger.info('Fallback worker started');

  setInterval(async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const stuckHedges = await prisma.hedgePosition.findMany({
        where: {
          status: 'OPEN',
          entryTimestamp: { lt: oneHourAgo },
        },
        include: { rule: true },
      });

      for (const hedge of stuckHedges) {
        const timeElapsed = Date.now() - hedge.entryTimestamp.getTime();
        const timeoutMs = hedge.rule.timeoutMinutes * 60 * 1000;

        if (timeElapsed >= timeoutMs * 1.5) {
          logger.warn({ hedgePositionId: hedge.id }, 'Stuck hedge detected, forcing close');
          await hedgeQueue.add('close-hedge', {
            action: 'close',
            hedgePositionId: hedge.id,
            reason: 'TIMEOUT',
          });
        }
      }
    } catch (error) {
      logger.error({ error }, 'Fallback check failed');
    }
  }, 60000);
}

checkStuckHedges().catch((error) => {
  logger.error({ error }, 'Fallback worker crashed');
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('Fallback worker shutting down');
  process.exit(0);
});
