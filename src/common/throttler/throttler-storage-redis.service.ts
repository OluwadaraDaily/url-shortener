import { ThrottlerStorage } from '@nestjs/throttler';
import { Redis } from 'ioredis';

interface RedisOptions {
  host: string;
  port: number;
}

interface StorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

export class ThrottlerStorageRedisService implements ThrottlerStorage {
  private readonly redis: Redis;

  constructor(options: RedisOptions) {
    this.redis = new Redis({
      host: options.host,
      port: options.port,
      enableReadyCheck: false,
      maxRetriesPerRequest: 0,
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _throttlerName: string,
  ): Promise<StorageRecord> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, ttl);
    }
    const isBlocked = count > limit;
    if (isBlocked && blockDuration > 0) {
      await this.redis.expire(key, blockDuration);
    }
    return {
      totalHits: count,
      timeToExpire: ttl,
      isBlocked,
      timeToBlockExpire: isBlocked ? blockDuration : 0,
    };
  }

  async get(key: string): Promise<StorageRecord | null> {
    const [count, ttl] = await Promise.all([
      this.redis.get(key),
      this.redis.ttl(key),
    ]);

    if (!count) {
      return null;
    }

    const totalHits = parseInt(count, 10);
    return {
      totalHits,
      timeToExpire: ttl,
      isBlocked: false, // This will be calculated based on your limit when checking
      timeToBlockExpire: 0,
    };
  }
}
