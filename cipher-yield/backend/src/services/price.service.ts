import { redis, redisPub, redisSub } from '../config/redis.js';
import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { retry } from '../utils/retry.js';
import { env } from '../config/env.js';

interface PriceSource {
  name: string;
  price: bigint | null;
  weight: number;
}

interface ConsensusPriceResult {
  consensus: bigint;
  sources: PriceSource[];
  deviation: number;
  timestamp: number;
}

const PRICE_CACHE_KEY = 'price:SOL:USDC';
const PRICE_HISTORY_KEY = 'price:history:SOL:USDC';
const PRICE_CACHE_TTL = 1; // 500ms in Redis (use milliseconds)

export class PriceService {
  private lastValidPrice: bigint | null = null;
  private lastPriceTimestamp: number = 0;

  async getJupiterPrice(): Promise<bigint | null> {
    try {
      const response = await fetch(
        `${env.JUPITER_API_URL}/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000`
      );
      const data = await response.json();
      return BigInt(data.outAmount);
    } catch (error) {
      logger.error({ error }, 'Jupiter price fetch failed');
      return null;
    }
  }

  async getPythPrice(): Promise<bigint | null> {
    try {
      const response = await fetch(
        `${env.PYTH_ENDPOINT}/api/latest_price_feeds?ids[]=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`
      );
      const data = await response.json();
      const priceData = data[0];
      if (!priceData) return null;

      const price = BigInt(priceData.price.price);
      const expo = priceData.price.expo;
      return price * BigInt(10 ** (6 + expo));
    } catch (error) {
      logger.error({ error }, 'Pyth price fetch failed');
      return null;
    }
  }

  async getSwitchboardPrice(): Promise<bigint | null> {
    try {
      const response = await fetch(
        `${env.SWITCHBOARD_ENDPOINT}/api/feeds/GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR`
      );
      const data = await response.json();
      return BigInt(Math.floor(data.result.value * 1_000_000));
    } catch (error) {
      logger.error({ error }, 'Switchboard price fetch failed');
      return null;
    }
  }

  async getConsensusPrice(): Promise<ConsensusPriceResult> {
    const [jupiterPrice, pythPrice, switchboardPrice] = await Promise.all([
      retry(() => this.getJupiterPrice(), 2, 500, false),
      retry(() => this.getPythPrice(), 2, 500, false),
      retry(() => this.getSwitchboardPrice(), 2, 500, false),
    ]);

    const sources: PriceSource[] = [
      { name: 'jupiter', price: jupiterPrice, weight: 0.4 },
      { name: 'pyth', price: pythPrice, weight: 0.35 },
      { name: 'switchboard', price: switchboardPrice, weight: 0.25 },
    ];

    const validSources = sources.filter(s => s.price !== null);

    if (validSources.length === 0) {
      if (this.lastValidPrice && Date.now() - this.lastPriceTimestamp < 60000) {
        logger.warn('All price sources failed, using last valid price');
        return {
          consensus: this.lastValidPrice,
          sources,
          deviation: 0,
          timestamp: this.lastPriceTimestamp,
        };
      }
      throw new Error('All price sources failed and no valid fallback');
    }

    const prices = validSources.map(s => s.price!);
    const maxDeviation = this.calculateMaxDeviation(prices);

    if (maxDeviation > 0.02) {
      logger.warn({ maxDeviation, prices }, 'Price deviation exceeds 2%');
    }

    const consensus = this.calculateWeightedMedian(validSources);

    this.lastValidPrice = consensus;
    this.lastPriceTimestamp = Date.now();

    return {
      consensus,
      sources,
      deviation: maxDeviation,
      timestamp: this.lastPriceTimestamp,
    };
  }

  private calculateWeightedMedian(sources: Array<{ price: bigint; weight: number }>): bigint {
    const sorted = [...sources].sort((a, b) => Number(a.price - b.price));

    let cumulativeWeight = 0;
    const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);

    for (const source of sorted) {
      cumulativeWeight += source.weight;
      if (cumulativeWeight >= totalWeight / 2) {
        return source.price;
      }
    }

    return sorted[Math.floor(sorted.length / 2)]!.price;
  }

  private calculateMaxDeviation(prices: bigint[]): number {
    if (prices.length < 2) return 0;

    let maxDev = 0;
    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const dev = Math.abs(Number(prices[i]! - prices[j]!)) / Number(prices[i]!);
        maxDev = Math.max(maxDev, dev);
      }
    }
    return maxDev;
  }

  async storePriceSnapshot(result: ConsensusPriceResult): Promise<void> {
    await prisma.priceSnapshot.create({
      data: {
        asset: 'SOL:USDC',
        jupiterPrice: result.sources.find(s => s.name === 'jupiter')?.price,
        pythPrice: result.sources.find(s => s.name === 'pyth')?.price,
        switchboardPrice: result.sources.find(s => s.name === 'switchboard')?.price,
        consensusPrice: result.consensus,
        deviation: Math.floor(result.deviation * 10000),
      },
    });

    await redis.setex(PRICE_CACHE_KEY, PRICE_CACHE_TTL, result.consensus.toString());
    await redis.lpush(PRICE_HISTORY_KEY, result.consensus.toString());
    await redis.ltrim(PRICE_HISTORY_KEY, 0, 299);
  }

  async publishPrice(result: ConsensusPriceResult): Promise<void> {
    await redisPub.publish(
      PRICE_CACHE_KEY,
      JSON.stringify({
        price: result.consensus.toString(),
        timestamp: result.timestamp,
        deviation: result.deviation,
      })
    );
  }

  async getPriceHistory(minutes: number): Promise<bigint[]> {
    const count = minutes * 2;
    const history = await redis.lrange(PRICE_HISTORY_KEY, 0, count - 1);
    return history.map(p => BigInt(p));
  }

  isPriceStale(): boolean {
    return Date.now() - this.lastPriceTimestamp > env.PRICE_STALENESS_THRESHOLD_MS;
  }

  async getVolatility(windowMinutes: number = 30): Promise<number> {
    const prices = await this.getPriceHistory(windowMinutes);
    if (prices.length < 2) return 0;

    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const ret = Number(prices[i]! - prices[i - 1]!) / Number(prices[i - 1]!);
      returns.push(ret);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }
}

export const priceService = new PriceService();
