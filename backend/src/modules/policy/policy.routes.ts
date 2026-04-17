import { FastifyInstance } from 'fastify';
import { PolicyService } from './policy.service';
import { ConsensusService } from '../price/consensus.service';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function policyRoutes(fastify: FastifyInstance) {
  const policyService = new PolicyService();
  const consensusService = new ConsensusService();

  fastify.post('/api/policy/create', { preHandler: authMiddleware }, async (request, reply) => {
    const { walletAddress, triggerPercent, hedgePercent, timeoutMinutes } = request.body as any;

    try {
      const priceSnapshot = await consensusService.getCurrentPrice();
      if (!priceSnapshot) {
        return reply.code(400).send({ error: 'Failed to get current price' });
      }

      const ruleId = await policyService.createRule(walletAddress, {
        triggerPercent,
        hedgePercent,
        timeoutMinutes,
        referencePrice: priceSnapshot.consensusPrice,
      });

      return { success: true, ruleId };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.get('/api/policy/:walletAddress', async (request, reply) => {
    const { walletAddress } = request.params as any;

    try {
      const ruleData = await policyService.getActiveRule(walletAddress);
      if (!ruleData) {
        return reply.code(404).send({ error: 'No active rule found' });
      }

      return {
        ruleId: ruleData.id,
        triggerPercent: ruleData.rule.triggerPercent,
        hedgePercent: ruleData.rule.hedgePercent,
        timeoutMinutes: ruleData.rule.timeoutMinutes,
        referencePrice: ruleData.rule.referencePrice,
      };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.delete('/api/policy/:walletAddress', { preHandler: authMiddleware }, async (request, reply) => {
    const { walletAddress } = request.params as any;

    try {
      await policyService.deactivateRule(walletAddress);
      return { success: true };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });
}
