import { z } from 'zod';

const envSchema = z.object({
  // Solana
  SOLANA_RPC_URL: z.string().url(),
  SOLANA_WS_URL: z.string().url(),
  PROGRAM_ID: z.string().length(44),
  VAULT_ADDRESS: z.string().length(44),
  OPERATOR_KEYPAIR_PATH: z.string(),
  OPERATOR_INDEX: z.coerce.number().int().min(1).max(3),

  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  // Integrations
  JUPITER_API_URL: z.string().url().default('https://quote-api.jup.ag/v6'),
  DRIFT_PROGRAM_ID: z.string().length(44),
  PYTH_ENDPOINT: z.string().url(),
  SWITCHBOARD_ENDPOINT: z.string().url(),
  ARWEAVE_WALLET_PATH: z.string(),

  // Security
  JWT_SECRET: z.string().min(32),

  // TEE
  TEE_ENCLAVE_SOCKET: z.string().optional(),

  // Trading Parameters
  PRICE_STALENESS_THRESHOLD_MS: z.coerce.number().default(3000),
  MAX_SLIPPAGE_BPS: z.coerce.number().default(50),
  CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().default(0.15),

  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Environment validation failed:');
    console.error(parsed.error.format());
    throw new Error('Invalid environment configuration');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export const env = getEnv();
