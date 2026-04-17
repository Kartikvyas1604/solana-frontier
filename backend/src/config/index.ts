import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SOLANA_RPC_URL: z.string().url(),
  SOLANA_CLUSTER: z.enum(['mainnet-beta', 'devnet', 'testnet']),
  VAULT_KEYPAIR_PATH: z.string(),
  OPERATOR_1_KEY: z.string(),
  OPERATOR_2_KEY: z.string(),
  OPERATOR_3_KEY: z.string(),
  ENCRYPTION_KEY: z.string().length(64),
  DRIFT_ENV: z.enum(['mainnet-beta', 'devnet']),
  PYTH_ENDPOINT: z.string().url(),
  JUPITER_PRICE_API: z.string().url(),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Configuration validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
