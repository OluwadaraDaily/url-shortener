import { ThrottlerStorage } from '@nestjs/throttler';

interface StorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
  createdAt: number;
}

export class MockThrottlerStorageService implements ThrottlerStorage {
  private storage: Map<string, StorageRecord> = new Map();

  increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): Promise<StorageRecord> {
    const now = Date.now();
    const existingRecord = this.storage.get(key);

    // Check if the record exists and if it has expired
    if (existingRecord) {
      const timeSinceCreation = now - existingRecord.createdAt;
      if (timeSinceCreation >= existingRecord.timeToExpire) {
        // TTL expired, remove the record
        this.storage.delete(key);
      }
    }

    const record: StorageRecord = this.storage.get(key) || {
      totalHits: 0,
      timeToExpire: ttl,
      isBlocked: false,
      timeToBlockExpire: 0,
      createdAt: now,
    };

    record.totalHits += 1;
    record.isBlocked = record.totalHits > limit;

    if (record.isBlocked && blockDuration > 0) {
      record.timeToBlockExpire = blockDuration;
    }

    this.storage.set(key, record);
    return Promise.resolve(record);
  }

  get(key: string): Promise<StorageRecord | null> {
    const record = this.storage.get(key);
    if (!record) {
      return Promise.resolve(null);
    }

    const now = Date.now();
    const timeSinceCreation = now - record.createdAt;

    // Check if the record has expired
    if (timeSinceCreation >= record.timeToExpire) {
      this.storage.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(record);
  }

  reset(): void {
    this.storage.clear();
  }
}
