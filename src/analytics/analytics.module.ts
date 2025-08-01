import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController, MetricsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClickLogs } from './entities/click_logs.entity';
import { UrlMetricsDaily } from './entities/url_metrics_daily.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClickLogs, UrlMetricsDaily]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AnalyticsController, MetricsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
