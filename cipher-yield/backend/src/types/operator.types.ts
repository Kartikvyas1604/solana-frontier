export interface OperatorSignature {
  operatorIndex: number;
  signature: string;
  publicKey: string;
  timestamp: number;
}

export interface MultiSigValidation {
  requiredSignatures: number;
  signatures: OperatorSignature[];
  isValid: boolean;
}
