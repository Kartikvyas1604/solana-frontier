import { FastifyRequest, FastifyReply } from 'fastify';
import { verifySignature } from '../utils/solana';
import { logger } from '../utils/logger';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const signature = request.headers['x-wallet-signature'] as string;
  const message = request.headers['x-wallet-message'] as string;
  const walletAddress = (request.body as any)?.walletAddress || (request.params as any)?.walletAddress;

  if (!signature || !message || !walletAddress) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Missing authentication headers or wallet address',
    });
  }

  const isValid = verifySignature(message, signature, walletAddress);

  if (!isValid) {
    logger.warn({ walletAddress }, 'Invalid signature');
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Invalid signature',
    });
  }

  const messageTimestamp = parseInt(message.split(':')[1] || '0');
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (Math.abs(now - messageTimestamp) > fiveMinutes) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Message timestamp expired',
    });
  }
}
