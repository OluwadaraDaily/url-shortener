import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClickLogsDto } from './dto/create-click-logs.dto';
import { UpdateClickLogsDto } from './dto/update-click-logs.dto';
import { ClickLogs } from './entities/click_logs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ClickLogs)
    private clickLogsRepository: Repository<ClickLogs>,
  ) {}

  async createClickLog(createClickLogsDto: CreateClickLogsDto) {
    const clickLog = this.clickLogsRepository.create(createClickLogsDto);
    return this.clickLogsRepository.save(clickLog);
  }

  async findAllClickLogs() {
    return this.clickLogsRepository.find();
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
}
