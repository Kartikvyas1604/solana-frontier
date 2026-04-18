import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connection = new Connection(env.SOLANA_RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  wsEndpoint: env.SOLANA_WS_URL,
});

export const programId = new PublicKey(env.PROGRAM_ID);
export const vaultAddress = new PublicKey(env.VAULT_ADDRESS);

let operatorKeypair: Keypair | null = null;

export function getOperatorKeypair(): Keypair {
  if (operatorKeypair) return operatorKeypair;

  try {
    const keypairData = JSON.parse(readFileSync(env.OPERATOR_KEYPAIR_PATH, 'utf-8'));
    operatorKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    logger.info({ pubkey: operatorKeypair.publicKey.toBase58() }, 'Operator keypair loaded');
    return operatorKeypair;
  } catch (error) {
    logger.error({ error }, 'Failed to load operator keypair');
    throw new Error('Failed to load operator keypair');
  }
}

export async function confirmTransaction(signature: string, maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await connection.confirmTransaction(signature, 'confirmed');
      if (result.value.err) {
        logger.error({ signature, error: result.value.err }, 'Transaction failed');
        return false;
      }
      return true;
    } catch (error) {
      logger.warn({ signature, attempt: i + 1, error }, 'Transaction confirmation attempt failed');
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return false;
}
