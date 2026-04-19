export interface VaultState {
  totalAssets: number;
  totalShares: number;
  nav: number;
  peakNav: number;
  drawdown: number;
  lastUpdate: number;
}

export interface HedgePosition {
  id: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  fundingRate: number;
  openedAt: number;
  status: "active" | "closed";
}

export interface Strategy {
  id: string;
  ruleHash: string;
  drawdownThreshold: number;
  hedgeRatio: number;
  timeLimit?: number;
  status: "active" | "inactive";
}

export interface ProofBundle {
  id: string;
  executionId: string;
  timestamp: number;
  priceData: {
    asset: string;
    price: number;
    source: string;
  }[];
  operatorSignatures: string[];
  arweaveUrl?: string;
}

export interface UserPosition {
  shares: number;
  value: number;
  depositedAt: number;
}
