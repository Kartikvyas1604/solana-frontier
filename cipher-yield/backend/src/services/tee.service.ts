import { createConnection, Socket } from 'net';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ExecutionIntent } from '../types/strategy.types.js';

interface EnclaveResponse {
  decryptedRules: {
    stopLossThreshold: number;
    hedgeRatio: number;
    maxHedgeDuration: number;
    recoveryThreshold: number;
    volatilityThreshold: number;
  };
  executionIntent: ExecutionIntent;
  enclaveSignature: string;
  attestationDocument?: string;
}

export class TEEService {
  private socket: Socket | null = null;
  private useMockEnclave: boolean;

  constructor() {
    this.useMockEnclave = !env.TEE_ENCLAVE_SOCKET || env.NODE_ENV === 'development';
  }

  async connect(): Promise<void> {
    if (this.useMockEnclave) {
      logger.info('Using mock enclave for development');
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket = createConnection(env.TEE_ENCLAVE_SOCKET!, () => {
        logger.info('Connected to TEE enclave');
        resolve();
      });

      this.socket.on('error', (err) => {
        logger.error({ err }, 'TEE enclave connection error');
        reject(err);
      });
    });
  }

  async evaluateStrategy(
    encryptedStrategy: string,
    vaultState: {
      currentNav: bigint;
      peakNav: bigint;
      activeHedge: boolean;
      currentPrice: bigint;
    }
  ): Promise<EnclaveResponse> {
    if (this.useMockEnclave) {
      return this.mockEnclaveEvaluation(vaultState);
    }

    if (!this.socket) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        encryptedStrategy,
        vaultState: {
          currentNav: vaultState.currentNav.toString(),
          peakNav: vaultState.peakNav.toString(),
          activeHedge: vaultState.activeHedge,
          currentPrice: vaultState.currentPrice.toString(),
        },
        timestamp: Date.now(),
      });

      this.socket!.write(payload);

      this.socket!.once('data', (data) => {
        try {
          const response = JSON.parse(data.toString());

          if (!this.verifyAttestationDocument(response.attestationDocument)) {
            reject(new Error('Invalid attestation document'));
            return;
          }

          resolve(response);
        } catch (error) {
          reject(error);
        }
      });

      setTimeout(() => reject(new Error('TEE evaluation timeout')), 5000);
    });
  }

  private mockEnclaveEvaluation(vaultState: {
    currentNav: bigint;
    peakNav: bigint;
    activeHedge: boolean;
    currentPrice: bigint;
  }): EnclaveResponse {
    const drawdown = Number(vaultState.peakNav - vaultState.currentNav) / Number(vaultState.peakNav);

    const decryptedRules = {
      stopLossThreshold: 0.1,
      hedgeRatio: 0.5,
      maxHedgeDuration: 86400000,
      recoveryThreshold: 0.05,
      volatilityThreshold: 0.05,
    };

    let action: 'HEDGE_OPEN' | 'HEDGE_CLOSE' | 'REBALANCE' = 'REBALANCE';
    let size = 0n;

    if (drawdown >= decryptedRules.stopLossThreshold && !vaultState.activeHedge) {
      action = 'HEDGE_OPEN';
      size = (vaultState.currentNav * BigInt(Math.floor(decryptedRules.hedgeRatio * 10000))) / 10000n;
    } else if (vaultState.activeHedge) {
      action = 'HEDGE_CLOSE';
      size = 0n;
    }

    const executionIntent: ExecutionIntent = {
      action,
      size,
      targetPrice: vaultState.currentPrice,
      timestamp: Date.now(),
    };

    const mockSignature = Buffer.from(
      `mock_enclave_sig_${Date.now()}_${action}`
    ).toString('base64');

    return {
      decryptedRules,
      executionIntent,
      enclaveSignature: mockSignature,
    };
  }

  private verifyAttestationDocument(attestationDoc?: string): boolean {
    if (this.useMockEnclave) return true;
    if (!attestationDoc) return false;

    try {
      const decoded = Buffer.from(attestationDoc, 'base64');
      return decoded.length > 0;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
      logger.info('Disconnected from TEE enclave');
    }
  }
}

export const teeService = new TEEService();
