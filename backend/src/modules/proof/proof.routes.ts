import { FastifyInstance } from 'fastify';
import { ProofService } from './proof.service';

export async function proofRoutes(fastify: FastifyInstance) {
  const proofService = new ProofService();

  fastify.get('/api/proof/:hedgePositionId', async (request, reply) => {
    const { hedgePositionId } = request.params as any;

    try {
      const proof = await proofService.getProof(hedgePositionId);
      if (!proof) {
        return reply.code(404).send({ error: 'Proof not found' });
      }

      return proof;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/api/proof/verify', async (request, reply) => {
    const { proofId } = request.body as any;

    try {
      const result = await proofService.verifyProof(proofId);
      return result;
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
