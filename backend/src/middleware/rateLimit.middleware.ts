import rateLimit from '@fastify/rate-limit';

export const rateLimitConfig = {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (request: any) => {
    return (request.body?.walletAddress ||
            request.params?.walletAddress ||
            request.ip);
  },
};
