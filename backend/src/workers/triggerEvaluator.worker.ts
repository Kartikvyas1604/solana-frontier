import { prisma } from '../db/client';
import { PolicyService } from '../modules/policy/policy.service';
import { ConsensusService } from '../modules/price/consensus.service';
import { hedgeQueue } from '../queues';
import { logger } from '../utils/logger';

const policyService = new PolicyService();
const consensusService = new ConsensusService();

async function evaluateTriggers(): Promise<void> {
  logger.info('Trigger evaluator worker started');

  setInterval(async () => {
    try {
      const activeRules = await prisma.protectionRule.findMany({
        where: { status: 'ACTIVE' },
      });

      const priceSnapshot = await consensusService.getCurrentPrice();
      if (!priceSnapshot || !priceSnapshot.isValid) {
        logger.warn('Invalid price consensus, skipping evaluation');
        return;
      }

      logger.debug({
        price: priceSnapshot.consensusPrice,
        ruleCount: activeRules.length
      }, 'Evaluating triggers');

      for (const rule of activeRules) {
        const ruleData = await policyService.getActiveRule(rule.walletAddress);
        if (!ruleData) continue;

        const priceChange = (priceSnapshot.consensusPrice - ruleData.rule.referencePrice) / ruleData.rule.referencePrice;
        const priceDrop = -priceChange * 100;

        const existingHedge = await prisma.hedgePosition.findFirst({
          where: { ruleId: rule.id, status: 'OPEN' },
        });

        if (!existingHedge && priceDrop >= ruleData.rule.triggerPercent) {
          logger.info({
            walletAddress: rule.walletAddress,
            priceDrop
          }, 'Trigger condition met, enqueuing hedge');

          await hedgeQueue.add('open-hedge', {
            action: 'open',
            walletAddress: rule.walletAddress,
          });
        }

        if (existingHedge) {
          const recoveryPrice = ruleData.rule.referencePrice * 0.99;
          const timeElapsed = Date.now() - existingHedge.entryTimestamp.getTime();
          const timeoutMs = ruleData.rule.timeoutMinutes * 60 * 1000;

          if (priceSnapshot.consensusPrice >= recoveryPrice) {
            logger.info({ hedgePositionId: existingHedge.id }, 'Price recovered, closing hedge');
            await hedgeQueue.add('close-hedge', {
              action: 'close',
              hedgePositionId: existingHedge.id,
              reason: 'RECOVERY',
            });
          } else if (timeElapsed >= timeoutMs) {
            logger.info({ hedgePositionId: existingHedge.id }, 'Timeout reached, closing hedge');
            await hedgeQueue.add('close-hedge', {
              action: 'close',
              hedgePositionId: existingHedge.id,
              reason: 'TIMEOUT',
            });
          }
        }
      }
    } catch (error) {
      logger.error({ error }, 'Trigger evaluation failed');
    }
  }, 5000);
}

evaluateTriggers().catch((error) => {
  logger.error({ error }, 'Trigger evaluator worker crashed');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('Trigger evaluator worker shutting down');
  await consensusService.disconnect();
  process.exit(0);
});
