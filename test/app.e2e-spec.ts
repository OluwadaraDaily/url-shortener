import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorageRedisService } from '../src/common/throttler/throttler-storage-redis.service';
import { MockThrottlerStorageService } from './mocks/throttler-storage-redis.mock';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
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
      .overrideProvider(ThrottlerStorageRedisService)
      .useClass(MockThrottlerStorageService)
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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
