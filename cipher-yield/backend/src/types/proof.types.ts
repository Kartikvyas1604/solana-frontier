export interface ProofBundle {
  version: '1.0';
  timestamp: number;
  vaultAddress: string;
  executionType: string;
  priceData: {
    jupiter: number;
    pyth: number;
    switchboard: number;
    consensus: number;
    capturedAt: number;
  };
  executionIntent: {
    action: string;
    size: number;
    targetPrice: number;
  };
  ruleHash: string;
  enclaveSignature: string;
  operatorSignatures: string[];
  txSignature: string;
  arweaveTxId: string;
}
