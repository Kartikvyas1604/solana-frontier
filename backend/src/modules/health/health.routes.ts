import { FastifyInstance } from 'fastify';
import { healthService } from './health.service';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    const health = await healthService.getHealth();

    if (!health.healthy) {
      return reply.status(503).send(health);
    }

    return reply.send(health);
  });

  fastify.get('/health/detailed', async (request, reply) => {
    const detailed = await healthService.getDetailedHealth();

    if (!detailed.healthy) {
      return reply.status(503).send(detailed);
    }

    return reply.send(detailed);
  });

  fastify.get('/metrics', async (request, reply) => {
    const metrics = await healthService.getMetrics();
    return reply.send(metrics);
  });
}
