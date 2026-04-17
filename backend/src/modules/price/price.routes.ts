import { FastifyInstance } from 'fastify';
import { ConsensusService } from '../price/consensus.service';

export async function priceRoutes(fastify: FastifyInstance) {
  const consensusService = new ConsensusService();

  fastify.get('/api/price/current', async (request, reply) => {
    try {
      const snapshot = await consensusService.getCurrentPrice();
      if (!snapshot) {
        return reply.code(503).send({ error: 'Price data unavailable' });
      }

      return {
        pythPrice: snapshot.pythPrice,
        jupiterPrice: snapshot.jupiterPrice,
        consensusPrice: snapshot.consensusPrice,
        isValid: snapshot.isValid,
        capturedAt: snapshot.capturedAt,
      };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/api/price/history', async (request, reply) => {
    const { minutes = 30 } = request.query as any;

    try {
      const history = await consensusService.getPriceHistory(parseInt(minutes));
      return { snapshots: history };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
