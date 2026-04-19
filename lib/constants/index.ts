export const VAULT_CONFIG = {
  MAX_DRAWDOWN: 20,
  DEFAULT_HEDGE_RATIO: 50,
  MIN_DEPOSIT: 100,
  EXECUTION_LATENCY_TARGET: 5000,
} as const;

export const ANIMATION_DELAYS = {
  card1: 0,
  card2: 100,
  card3: 200,
  card4: 300,
} as const;

export const REFRESH_INTERVALS = {
  vault: 10000,
  prices: 5000,
  positions: 15000,
} as const;
