import Redis from 'ioredis';
import { PythService } from './pyth.service';
import { JupiterService } from './jupiter.service';
import { prisma } from '../../db/client';
import { config } from '../../config';
import { logger } from '../../utils/logger';

interface PriceSnapshot {
  pythPrice: number;
  jupiterPrice: number;
  consensusPrice: number;
  deviationPercent: number;
  isValid: boolean;
  capturedAt: Date;
}

export class ConsensusService {
  private redis: Redis;
  private pythService: PythService;
  private jupiterService: JupiterService;
  private readonly PRICE_KEY = 'price:snapshots';
  private readonly MAX_DEVIATION = 0.005;
  private readonly SNAPSHOT_TTL = 1800;

  constructor() {
    this.redis = new Redis(config.REDIS_URL);
    this.pythService = new PythService();
    this.jupiterService = new JupiterService();
  }

  async getCurrentPrice(): Promise<PriceSnapshot | null> {
    const pythPrice = await this.pythService.getSOLPrice();
    const jupiterPrice = await this.jupiterService.getSOLPrice();

    if (!pythPrice || !jupiterPrice) {
      logger.warn('Failed to fetch prices from one or both sources');
      return null;
    }

    const deviationPercent = Math.abs(pythPrice - jupiterPrice) / pythPrice;
    const isValid = deviationPercent <= this.MAX_DEVIATION;
    const consensusPrice = isValid ? (pythPrice + jupiterPrice) / 2 : pythPrice;

    const snapshot: PriceSnapshot = {
      pythPrice,
      jupiterPrice,
      consensusPrice,
      deviationPercent,
      isValid,
      capturedAt: new Date(),
    };

    await this.storeSnapshot(snapshot);

    return snapshot;
  }

  async isConsensusValid(): Promise<boolean> {
    const snapshot = await this.getCurrentPrice();
    return snapshot?.isValid ?? false;
  }

  async getPriceHistory(minutes: number): Promise<PriceSnapshot[]> {
    const key = this.PRICE_KEY;
    const now = Date.now();
    const minTimestamp = now - minutes * 60 * 1000;

    const snapshots = await this.redis.zrangebyscore(
      key,
      minTimestamp,
      now,
      'WITHSCORES'
    );

    const results: PriceSnapshot[] = [];
    for (let i = 0; i < snapshots.length; i += 2) {
      try {
        const data = JSON.parse(snapshots[i]);
        results.push({
          ...data,
          capturedAt: new Date(parseInt(snapshots[i + 1])),
        });
      } catch (error) {
        logger.error({ error }, 'Failed to parse price snapshot');
      }
    }

    return results;
  }

  private async storeSnapshot(snapshot: PriceSnapshot): Promise<void> {
    const timestamp = snapshot.capturedAt.getTime();
    const data = JSON.stringify({
      pythPrice: snapshot.pythPrice,
      jupiterPrice: snapshot.jupiterPrice,
      consensusPrice: snapshot.consensusPrice,
      deviationPercent: snapshot.deviationPercent,
      isValid: snapshot.isValid,
    });

    await this.redis.zadd(this.PRICE_KEY, timestamp, data);
    await this.redis.expire(this.PRICE_KEY, this.SNAPSHOT_TTL);
  }

  async flushToDatabase(): Promise<void> {
    const snapshots = await this.getPriceHistory(5);

    if (snapshots.length === 0) {
      return;
    }

    try {
      await prisma.priceSnapshot.createMany({
        data: snapshots.map(s => ({
          pythPrice: s.pythPrice,
          jupiterPrice: s.jupiterPrice,
          consensusPrice: s.consensusPrice,
          deviationPercent: s.deviationPercent,
          isValid: s.isValid,
          capturedAt: s.capturedAt,
        })),
        skipDuplicates: true,
      });

      logger.info({ count: snapshots.length }, 'Flushed price snapshots to database');
    } catch (error) {
      logger.error({ error }, 'Failed to flush snapshots to database');
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
