import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MockThrottlerStorageService } from './mocks/throttler-storage-redis.mock';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerModule } from '../src/common/throttler/throttler.module';

describe('Throttler (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mockThrottlerStorage: MockThrottlerStorageService;

  beforeAll(async () => {
    mockThrottlerStorage = new MockThrottlerStorageService();

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(AppThrottlerModule)
      .useModule(
        ThrottlerModule.forRoot({
          throttlers: [
            {
              name: 'default',
              ttl: 1000,
              limit: 3,
              blockDuration: 2000,
            },
          ],
          storage: mockThrottlerStorage,
        }),
      )
      .overrideProvider(ConfigService)
      .useValue({
        getOrThrow: (key: string): string | number => {
          switch (key) {
            case 'REDIS_HOST':
              return 'localhost';
            case 'REDIS_PORT':
              return 6379;
            default:
              throw new Error(`Unexpected config key: ${key}`);
          }
        },
        get: (key: string, defaultValue: number): number => {
          switch (key) {
            case 'THROTTLE_TTL':
              return 1000;
            case 'THROTTLE_LIMIT':
              return 3;
            case 'THROTTLE_BLOCK_DURATION':
              return 2000;
            default:
              return defaultValue;
          }
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  beforeEach(() => {
    mockThrottlerStorage.reset();
  });

  it('should allow requests within rate limit', async () => {
    // Make requests up to the limit (3 requests)
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer()).get('/test-throttle').expect(200);
    }
  });

  it('should block requests exceeding rate limit', async () => {
    // Make requests up to the limit
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer()).get('/test-throttle').expect(200);
    }

    // This request should be blocked
    await request(app.getHttpServer()).get('/test-throttle').expect(429); // Too Many Requests
  });

  it('should reset rate limit after TTL', async () => {
    // Make requests up to the limit
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer()).get('/test-throttle').expect(200);
    }

    // Wait for TTL to expire (1 second + buffer)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Should be able to make requests again
    await request(app.getHttpServer()).get('/test-throttle').expect(200);
  });
});
