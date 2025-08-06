import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from './throttler-storage-redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.getOrThrow('REDIS_HOST');
        const redisPort = parseInt(configService.getOrThrow('REDIS_PORT'), 10);

        return {
          throttlers: [
            {
              name: 'default',
              ttl: configService.get('THROTTLE_TTL', 60000),
              limit: configService.get('THROTTLE_LIMIT', 10),
              blockDuration: configService.get(
                'THROTTLE_BLOCK_DURATION',
                300000,
              ),
            },
          ],
          storage: new ThrottlerStorageRedisService({
            host: redisHost,
            port: redisPort,
          }),
        };
      },
    }),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
