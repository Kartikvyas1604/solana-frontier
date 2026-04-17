import axios from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class JupiterService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.JUPITER_PRICE_API;
  }

  async getSOLPrice(): Promise<number | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/price`, {
        params: {
          ids: 'SOL',
        },
        timeout: 5000,
      });

      if (!response.data?.data?.SOL?.price) {
        logger.warn('Invalid Jupiter price response');
        return null;
      }

      return response.data.data.SOL.price;
    } catch (error) {
      logger.error({ error }, 'Failed to fetch Jupiter price');
      return null;
    }
  }
}
