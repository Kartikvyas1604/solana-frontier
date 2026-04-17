import { PythHttpClient, getPythProgramKeyForCluster } from '@pythnetwork/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class PythService {
  private client: PythHttpClient;
  private solPriceId = 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d';

  constructor() {
    this.client = new PythHttpClient(
      new Connection(config.SOLANA_RPC_URL),
      getPythProgramKeyForCluster(config.SOLANA_CLUSTER as any)
    );
  }

  async getSOLPrice(): Promise<number | null> {
    try {
      const priceData = await this.client.getAssetPricesFromAccounts([
        new PublicKey(this.solPriceId)
      ]);

      if (!priceData || priceData.length === 0) {
        logger.warn('No Pyth price data received');
        return null;
      }

      const price = priceData[0];
      if (!price.price || !price.confidence) {
        logger.warn('Invalid Pyth price data structure');
        return null;
      }

      return price.price;
    } catch (error) {
      logger.error({ error }, 'Failed to fetch Pyth price');
      return null;
    }
  }
}
