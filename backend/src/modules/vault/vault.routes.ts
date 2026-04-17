import { FastifyInstance } from 'fastify';
import { VaultService } from './vault.service';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function vaultRoutes(fastify: FastifyInstance) {
  const vaultService = new VaultService();

  fastify.post('/api/vault/deposit', async (request, reply) => {
    const { walletAddress, txSignature } = request.body as any;

    try {
      const positionId = await vaultService.deposit(walletAddress, txSignature);
      return { success: true, positionId };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.post('/api/vault/withdraw', { preHandler: authMiddleware }, async (request, reply) => {
    const { walletAddress, shares } = request.body as any;

    try {
      const positionId = await vaultService.withdraw(walletAddress, shares);
      return { success: true, positionId };
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.get('/api/vault/state/:walletAddress', async (request, reply) => {
    const { walletAddress } = request.params as any;

    try {
      const state = await vaultService.getState(walletAddress);
      return state;
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  });
}
