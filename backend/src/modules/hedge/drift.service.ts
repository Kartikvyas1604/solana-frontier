import { DriftClient, initialize, Wallet, BN, PositionDirection, MarketType } from '@drift-labs/sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import fs from 'fs';

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export class DriftService {
  private client: DriftClient | null = null;
  private connection: Connection;
  private wallet: Wallet;

  constructor() {
    this.connection = new Connection(config.SOLANA_RPC_URL, 'confirmed');
    const keypairData = JSON.parse(fs.readFileSync(config.VAULT_KEYPAIR_PATH, 'utf-8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    this.wallet = new Wallet(keypair);
  }

  async initialize(): Promise<void> {
    const env = config.DRIFT_ENV === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
    this.client = new DriftClient({
      connection: this.connection,
      wallet: this.wallet,
      env,
    });

    await this.client.subscribe();
    logger.info('Drift client initialized');
  }

  async openShortPosition(sizeSOL: number, slippageBps: number = 50): Promise<Result<string>> {
    if (!this.client) {
      return { ok: false, error: new Error('Drift client not initialized') };
    }

    try {
      const marketIndex = 0;
      const baseAssetAmount = new BN(sizeSOL * 1e9);

      const hasMargin = await this.checkMargin(sizeSOL);
      if (!hasMargin) {
        return { ok: false, error: new Error('INSUFFICIENT_MARGIN') };
      }

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const tx = await this.client.openPosition(
            PositionDirection.SHORT,
            baseAssetAmount,
            marketIndex,
            new BN(slippageBps)
          );

          logger.info({ tx, sizeSOL }, 'Opened short position on Drift');
          return { ok: true, value: tx };
        } catch (error: any) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return { ok: false, error: new Error('Max retry attempts reached') };
    } catch (error: any) {
      logger.error({ error }, 'Failed to open short position');
      return { ok: false, error };
    }
  }

  async closePosition(driftPositionId: string): Promise<Result<string>> {
    if (!this.client) {
      return { ok: false, error: new Error('Drift client not initialized') };
    }

    try {
      const marketIndex = 0;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const tx = await this.client.closePosition(marketIndex);
          logger.info({ tx, driftPositionId }, 'Closed position on Drift');
          return { ok: true, value: tx };
        } catch (error: any) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return { ok: false, error: new Error('Max retry attempts reached') };
    } catch (error: any) {
      logger.error({ error, driftPositionId }, 'Failed to close position');
      return { ok: false, error };
    }
  }

  async getPositionState(driftPositionId: string): Promise<Result<any>> {
    if (!this.client) {
      return { ok: false, error: new Error('Drift client not initialized') };
    }

    try {
      const position = this.client.getUser().getPerpPosition(0);
      return { ok: true, value: position };
    } catch (error: any) {
      logger.error({ error, driftPositionId }, 'Failed to get position state');
      return { ok: false, error };
    }
  }

  async getFundingCost(driftPositionId: string): Promise<Result<number>> {
    if (!this.client) {
      return { ok: false, error: new Error('Drift client not initialized') };
    }

    try {
      const position = this.client.getUser().getPerpPosition(0);
      if (!position) {
        return { ok: false, error: new Error('Position not found') };
      }

      const fundingCost = position.quoteAssetAmount.toNumber() / 1e6;
      return { ok: true, value: Math.abs(fundingCost) };
    } catch (error: any) {
      logger.error({ error, driftPositionId }, 'Failed to get funding cost');
      return { ok: false, error };
    }
  }

  private async checkMargin(sizeSOL: number): Promise<boolean> {
    if (!this.client) return false;

    try {
      const freeCollateral = this.client.getUser().getFreeCollateral();
      const requiredMargin = sizeSOL * 0.1;
      return freeCollateral.toNumber() / 1e6 >= requiredMargin;
    } catch (error) {
      logger.error({ error }, 'Failed to check margin');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.unsubscribe();
      logger.info('Drift client disconnected');
    }
  }
}
