import { PublicKey } from '@solana/web3.js';
import { getOperatorKeypair } from '../config/solana.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { signMessage, verifySignature } from '../utils/crypto.js';
import { OperatorSignature, MultiSigValidation } from '../types/operator.types.js';

const OPERATOR_TIMEOUT_MS = 3000;

export class OperatorService {
  private operatorEndpoints: Map<number, string> = new Map();

  constructor() {
    this.operatorEndpoints.set(1, process.env.OPERATOR_1_ENDPOINT || 'http://localhost:3001');
    this.operatorEndpoints.set(2, process.env.OPERATOR_2_ENDPOINT || 'http://localhost:3002');
    this.operatorEndpoints.set(3, process.env.OPERATOR_3_ENDPOINT || 'http://localhost:3003');
  }

  async signExecution(executionData: {
    vaultAddress: string;
    action: string;
    size: string;
    targetPrice: string;
    timestamp: number;
  }): Promise<OperatorSignature> {
    const keypair = getOperatorKeypair();
    const message = this.serializeExecutionData(executionData);
    const messageBytes = Buffer.from(message);

    const signature = signMessage(messageBytes, keypair.secretKey);

    return {
      operatorIndex: env.OPERATOR_INDEX,
      signature: Buffer.from(signature).toString('base64'),
      publicKey: keypair.publicKey.toBase58(),
      timestamp: Date.now(),
    };
  }

  async collectSignatures(
    executionData: {
      vaultAddress: string;
      action: string;
      size: string;
      targetPrice: string;
      timestamp: number;
    },
    requiredSignatures: number = 2
  ): Promise<MultiSigValidation> {
    const ownSignature = await this.signExecution(executionData);
    const signatures: OperatorSignature[] = [ownSignature];

    const otherOperators = Array.from(this.operatorEndpoints.keys())
      .filter(idx => idx !== env.OPERATOR_INDEX);

    const signaturePromises = otherOperators.map(operatorIndex =>
      this.requestSignatureFromOperator(operatorIndex, executionData)
    );

    const results = await Promise.allSettled(signaturePromises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        signatures.push(result.value);
      }
    }

    const isValid = signatures.length >= requiredSignatures;

    if (!isValid) {
      logger.warn(
        { collected: signatures.length, required: requiredSignatures },
        'Insufficient operator signatures'
      );
    }

    return {
      requiredSignatures,
      signatures,
      isValid,
    };
  }

  private async requestSignatureFromOperator(
    operatorIndex: number,
    executionData: any
  ): Promise<OperatorSignature | null> {
    const endpoint = this.operatorEndpoints.get(operatorIndex);
    if (!endpoint) {
      logger.warn({ operatorIndex }, 'No endpoint configured for operator');
      return null;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OPERATOR_TIMEOUT_MS);

      const response = await fetch(`${endpoint}/api/v1/operator/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executionData),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Operator ${operatorIndex} returned ${response.status}`);
      }

      const signature: OperatorSignature = await response.json();

      if (!this.verifyOperatorSignature(signature, executionData)) {
        logger.error({ operatorIndex }, 'Invalid signature from operator');
        return null;
      }

      return signature;
    } catch (error) {
      logger.error({ operatorIndex, error }, 'Failed to get signature from operator');
      return null;
    }
  }

  verifyOperatorSignature(
    signature: OperatorSignature,
    executionData: any
  ): boolean {
    try {
      const message = this.serializeExecutionData(executionData);
      const messageBytes = Buffer.from(message);
      const signatureBytes = Buffer.from(signature.signature, 'base64');
      const publicKey = new PublicKey(signature.publicKey).toBytes();

      return verifySignature(messageBytes, signatureBytes, publicKey);
    } catch (error) {
      logger.error({ error }, 'Signature verification failed');
      return false;
    }
  }

  private serializeExecutionData(data: any): string {
    return JSON.stringify({
      vaultAddress: data.vaultAddress,
      action: data.action,
      size: data.size,
      targetPrice: data.targetPrice,
      timestamp: data.timestamp,
    });
  }
}

export const operatorService = new OperatorService();
