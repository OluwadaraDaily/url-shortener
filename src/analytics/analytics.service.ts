import { Injectable } from '@nestjs/common';
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

  async create(createClickLogsDto: CreateClickLogsDto) {
    const clickLog = this.clickLogsRepository.create(createClickLogsDto);
    return this.clickLogsRepository.save(clickLog);
  }

  async findAll() {
    return this.clickLogsRepository.find();
  }

  async findOne(id: string) {
    return this.clickLogsRepository.findOne({ where: { id } });
  }

  async update(id: string, updateClickLogsDto: UpdateClickLogsDto) {
    return this.clickLogsRepository.update(id, updateClickLogsDto);
  }

  async remove(id: string) {
    return this.clickLogsRepository.delete(id);
  }
}
