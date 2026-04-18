export interface VaultState {
  address: string;
  totalAssets: bigint;
  totalShares: bigint;
  peakNav: bigint;
  currentNav: bigint;
  activeHedge: boolean;
  hedgePositionSize: bigint;
  lastExecutionTs: number;
}

export interface UserPositionData {
  owner: string;
  vault: string;
  shares: bigint;
  depositedAmount: bigint;
  depositTimestamp: number;
  strategyRuleHash: string;
}

export interface HedgePositionData {
  vaultId: string;
  size: bigint;
  entryPrice: bigint;
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
  driftPositionId?: string;
  pnl?: bigint;
}
