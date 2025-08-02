import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from './throttler-storage-redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get('THROTTLE_TTL', 60000),
            limit: configService.get('THROTTLE_LIMIT', 10),
            blockDuration: configService.get('THROTTLE_BLOCK_DURATION', 300000),
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: configService.get('REDIS_HOST', 'redis'),
          port: configService.get('REDIS_PORT', 6379),
        }),
      }),
    }),
  ],
  providers: [ThrottlerStorageRedisService],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
