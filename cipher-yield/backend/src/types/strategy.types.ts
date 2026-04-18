export interface StrategyRule {
  stopLossThreshold: number;
  hedgeRatio: number;
  maxHedgeDuration: number;
  recoveryThreshold: number;
  volatilityThreshold: number;
}

export interface EncryptedStrategy {
  ciphertext: string;
  nonce: string;
  publicKey: string;
}

export interface ExecutionIntent {
  action: 'HEDGE_OPEN' | 'HEDGE_CLOSE' | 'REBALANCE';
  size: bigint;
  targetPrice: bigint;
  timestamp: number;
}

export interface TriggerEvaluation {
  triggered: boolean;
  triggerType?: 'DRAWDOWN' | 'VOLATILITY' | 'TIME' | 'RECOVERY';
  currentDrawdown?: number;
  currentVolatility?: number;
  executionIntent?: ExecutionIntent;
}
