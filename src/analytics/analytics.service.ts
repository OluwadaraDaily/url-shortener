import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClickLogsDto } from './dto/create-click-logs.dto';
import { UpdateClickLogsDto } from './dto/update-click-logs.dto';
import { ClickLogs } from './entities/click_logs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { UrlMetricsDaily } from './entities/url_metrics_daily.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(ClickLogs)
    private clickLogsRepository: Repository<ClickLogs>,
    @InjectRepository(UrlMetricsDaily)
    private urlMetricsDailyRepository: Repository<UrlMetricsDaily>,
  ) {}

  async createClickLog(createClickLogsDto: CreateClickLogsDto) {
    const clickLog = this.clickLogsRepository.create(createClickLogsDto);
    return this.clickLogsRepository.save(clickLog);
  }

  async findAllClickLogs() {
    return this.clickLogsRepository.find();
  }

  async findAllClickLogsByUrlId(urlId: string) {
    return this.clickLogsRepository.find({
      where: { url_id: urlId },
      order: { created_at: 'DESC' },
    });
  }

  async findOneClickLog(id: string) {
    const clickLog = await this.clickLogsRepository.findOne({ where: { id } });
    if (!clickLog) {
      throw new NotFoundException('Click log not found');
    }
    return clickLog;
  }

  async updateClickLog(id: string, updateClickLogsDto: UpdateClickLogsDto) {
    const clickLog = await this.findOneClickLog(id);
    return this.clickLogsRepository.save({
      ...clickLog,
      ...updateClickLogsDto,
    });
  }

  async removeClickLog(id: string) {
    await this.findOneClickLog(id);
    return this.clickLogsRepository.delete(id);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyMetrics() {
    try {
      this.logger.log('Starting daily metrics aggregation...');

      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const endDate = new Date(yesterday);
      endDate.setHours(23, 59, 59, 999);

      // Get all clickLogs from yesterday
      const clickLogs = await this.clickLogsRepository.find({
        where: {
          created_at: Between(yesterday, endDate),
        },
      });

      // Group clickLogs by URL
      const urlGroups = this.groupClicksByUrl(clickLogs);

      // Process each URL's metrics
      for (const [urlId, urlClicks] of Object.entries(urlGroups)) {
        const metrics = this.calculateDailyMetrics(urlId, urlClicks, yesterday);
        console.log('metrics =>', metrics);
        await this.saveOrUpdateDailyMetrics(metrics);
      }

      this.logger.log('Daily metrics aggregation completed successfully');
    } catch (error) {
      this.logger.error('Error during daily metrics aggregation:', error);
      throw error;
    }
  }

  private groupClicksByUrl(
    clickLogs: ClickLogs[],
  ): Record<string, ClickLogs[]> {
    return clickLogs.reduce(
      (accumulator, clickLog) => {
        if (!accumulator[clickLog.url_id]) {
          accumulator[clickLog.url_id] = [];
        }
        accumulator[clickLog.url_id].push(clickLog);
        return accumulator;
      },
      {} as Record<string, ClickLogs[]>,
    );
  }

  private calculateDailyMetrics(
    urlId: string,
    clickLogs: ClickLogs[],
    date: Date,
  ) {
    const uniqueVisitors = new Set(
      clickLogs.map((clickLog: ClickLogs) => clickLog.ip_address),
    ).size;

    const browserDistribution = this.calculateDistribution(
      clickLogs,
      'user_agent',
    );
    const countryDistribution = this.calculateDistribution(
      clickLogs,
      'country',
    );
    const referrerDistribution = this.calculateDistribution(
      clickLogs,
      'referer',
    );

    const peakHour = this.calculatePeakHour(clickLogs);

    return {
      url_id: urlId,
      date,
      total_clicks: clickLogs.length,
      unique_visitors: uniqueVisitors,
      peak_hour: peakHour,
      browser_distribution: browserDistribution,
      country_distribution: countryDistribution,
      referrer_distribution: referrerDistribution,
    };
  }

  private calculateDistribution(
    clickLogs: ClickLogs[],
    field: keyof ClickLogs,
  ): Record<string, number> {
    return clickLogs.reduce(
      (accumulator, clickLog) => {
        const value = (clickLog[field] as string) || 'unknown';
        accumulator[value] = (accumulator[value] || 0) + 1;
        return accumulator;
      },
      {} as Record<string, number>,
    );
  }

  private calculatePeakHour(clickLogs: ClickLogs[]): number {
    const hourCounts: number[] = new Array(24).fill(0);

    for (const clickLog of clickLogs) {
      const hour = new Date(clickLog.created_at).getHours();
      hourCounts[hour]++;
    }

    return hourCounts.indexOf(Math.max(...hourCounts));
  }

  private async saveOrUpdateDailyMetrics(metrics: Partial<UrlMetricsDaily>) {
    const existing = await this.urlMetricsDailyRepository.findOne({
      where: {
        url_id: metrics.url_id,
        date: metrics.date,
      },
    });

    if (existing) {
      await this.urlMetricsDailyRepository.update(existing.id, metrics);
    } else {
      await this.urlMetricsDailyRepository.save(metrics);
    }
  }

  async getUrlMetrics(urlId: string, startDate?: Date, endDate?: Date) {
    const where: any = { url_id: urlId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date = { ...where.date, [MoreThanOrEqual.name]: startDate };
      }
      if (endDate) {
        where.date = { ...where.date, [LessThanOrEqual.name]: endDate };
      }
    }

    return this.urlMetricsDailyRepository.find({
      where,
      order: { date: 'DESC' },
    });
  }
}
