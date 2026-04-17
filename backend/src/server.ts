import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { disconnectPrisma } from './db/client';
import { vaultRoutes } from './modules/vault/vault.routes';
import { policyRoutes } from './modules/policy/policy.routes';
import { hedgeRoutes } from './modules/hedge/hedge.routes';
import { proofRoutes } from './modules/proof/proof.routes';
import { priceRoutes } from './modules/price/price.routes';
import { rateLimitConfig } from './middleware/rateLimit.middleware';
import { prisma } from './db/client';

const fastify = Fastify({
  logger: logger as any,
});

async function start() {
  try {
    await fastify.register(cors, {
      origin: true,
    });

    await fastify.register(rateLimit, rateLimitConfig);

    await fastify.register(vaultRoutes);
    await fastify.register(policyRoutes);
    await fastify.register(hedgeRoutes);
    await fastify.register(proofRoutes);
    await fastify.register(priceRoutes);

    fastify.get('/api/audit/:walletAddress', async (request, reply) => {
      const { walletAddress } = request.params as any;

      try {
        const logs = await prisma.auditLog.findMany({
          where: { walletAddress },
          orderBy: { timestamp: 'desc' },
          take: 100,
        });

        return { logs };
      } catch (error: any) {
        return reply.code(500).send({ error: error.message });
      }
    });

    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    fastify.setErrorHandler((error, request, reply) => {
      logger.error({ error, url: request.url }, 'Request error');

      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';

      reply.code(statusCode).send({
        error: error.name || 'ERROR',
        message,
      });
    });

    await fastify.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });

    logger.info(`Server listening on port ${config.PORT}`);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

async function shutdown() {
  logger.info('Shutting down server');

  try {
    await fastify.close();
    await disconnectPrisma();
    logger.info('Server shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
