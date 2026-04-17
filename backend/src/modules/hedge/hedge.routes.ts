import { FastifyInstance } from 'fastify';
import { HedgeService } from './hedge.service';
import { prisma } from '../../db/client';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function hedgeRoutes(fastify: FastifyInstance) {
  const hedgeService = new HedgeService();
  await hedgeService.initialize();

  fastify.get('/api/hedge/active/:walletAddress', async (request, reply) => {
    const { walletAddress } = request.params as any;

    try {
      const activeHedge = await prisma.hedgePosition.findFirst({
        where: { walletAddress, status: 'OPEN' },
      });

      if (!activeHedge) {
        return reply.code(404).send({ error: 'No active hedge found' });
      }

      const fundingResult = await hedgeService.getFundingAccrued(activeHedge.id);
      const fundingCost = fundingResult.ok ? fundingResult.value : 0;

      return {
        id: activeHedge.id,
        entryPrice: activeHedge.entryPrice,
        shortSizeSol: activeHedge.shortSizeSol,
        entryTimestamp: activeHedge.entryTimestamp,
        fundingCost,
      };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/api/hedge/history/:walletAddress', async (request, reply) => {
    const { walletAddress } = request.params as any;

    try {
      const history = await prisma.hedgePosition.findMany({
        where: { walletAddress, status: 'CLOSED' },
        orderBy: { closeTimestamp: 'desc' },
        take: 20,
      });

      return { positions: history };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/api/hedge/close', { preHandler: authMiddleware }, async (request, reply) => {
    const { hedgePositionId } = request.body as any;

    try {
      const result = await hedgeService.closeHedge(hedgePositionId, 'MANUAL');
      if (!result.ok) {
        return reply.code(400).send({ error: result.error.message });
      }

      return { success: true };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
