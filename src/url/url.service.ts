import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import * as crypto from 'crypto';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import { join } from 'path';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class UrlService implements OnModuleInit {
  private geoip: ReaderModel;
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @Inject(AnalyticsService)
    private readonly analyticsService: AnalyticsService,
  ) {}

  async onModuleInit() {
    try {
      this.geoip = await Reader.open(
        join(
          __dirname,
          '..',
          '..',
          'resources',
          'geoip',
          'GeoLite2-Country.mmdb',
        ),
      );
    } catch (error) {
      console.error('Failed to load GeoIP database:', error);
    }
  }

  generateShortCode(length: number = 6) {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters[randomBytes[i] % characters.length];
    }
    return result;
  }

  async generateUniqueShortCode(
    length: number = 6,
    maxAttempts: number = 5,
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const shortCode = this.generateShortCode(length);
      const existing = await this.urlRepository.findOne({
        where: { short_code: shortCode },
      });

      if (!existing) {
        return shortCode;
      }

      if (attempt === maxAttempts - 1) {
        return this.generateUniqueShortCode(length + 1, maxAttempts);
      }
    }
    throw new Error('Failed to generate unique short code');
  }

  async create(createUrlDto: CreateUrlDto) {
    const checkForDuplicateUrl = await this.urlRepository.findOne({
      where: { original_url: createUrlDto.original_url },
    });
    if (checkForDuplicateUrl) {
      throw new Error('URL already exists');
    }

    const checkForDuplicateTag = await this.urlRepository.findOne({
      where: { tag: createUrlDto.tag },
    });
    if (checkForDuplicateTag) {
      throw new Error('Tag already exists');
    }

    // Check if provided short_code already exists
    if (createUrlDto.short_code) {
      const existingShortCode = await this.urlRepository.findOne({
        where: { short_code: createUrlDto.short_code },
      });
      if (existingShortCode) {
        throw new Error('Short code already exists');
      }
    }

    const shortCode =
      createUrlDto.short_code || (await this.generateUniqueShortCode(6, 5));
    const url = this.urlRepository.create({
      ...createUrlDto,
      short_code: shortCode,
    });
    await this.urlRepository.save(url);
    return url;
  }

  async findAll() {
    return await this.urlRepository.find();
  }

  async findOne(id: string) {
    return await this.urlRepository.findOne({ where: { id } });
  }

  async findByShortCode(shortCode: string) {
    return await this.urlRepository.findOne({
      where: { short_code: shortCode },
    });
  }

  async findOneWithClickLogs(id: string) {
    return await this.urlRepository.findOne({
      where: { id },
      relations: { clickLogs: true },
    });
  }

  async update(id: string, updateUrlDto: UpdateUrlDto) {
    await this.urlRepository.update(id, updateUrlDto);
    return await this.urlRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.urlRepository.delete(id);
    return { message: 'Url deleted successfully' };
  }

  private isPrivateIP(ip: string): boolean {
    // Remove IPv6 prefix if present
    const ipv4 = ip.replace(/^::ffff:/, '');
    // Check if it's a private IPv4 address
    const parts = ipv4.split('.');
    if (parts.length !== 4) return true; // Invalid IPv4 format, treat as private
    const firstOctet = parseInt(parts[0]);
    const secondOctet = parseInt(parts[1]);

    return (
      firstOctet === 10 || // 10.0.0.0/8
      (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) || // 172.16.0.0/12
      (firstOctet === 192 && secondOctet === 168) || // 192.168.0.0/16
      firstOctet === 127 || // localhost
      ipv4 === '0.0.0.0'
    );
  }

  private getCountryFromIp(ip: string): string {
    try {
      if (!this.geoip) {
        console.error('GeoIP database not initialized');
        return 'Unknown';
      }

      // Handle private IP addresses
      if (this.isPrivateIP(ip)) {
        return 'Local';
      }

      const response = this.geoip.country(ip);
      return response?.country?.isoCode || 'Unknown';
    } catch (error) {
      console.error('Failed to get country from IP:', error);
      return 'Unknown';
    }
  }

  async redirectUrl(
    shortCode: string,
    request: ExpressRequest,
    ip: string,
  ): Promise<string> {
    const url = await this.urlRepository.findOne({
      where: { short_code: shortCode },
    });
    if (!url) {
      throw new NotFoundException('Url not found');
    }
    const country = this.getCountryFromIp(ip);
    const userAgent = request.headers['user-agent'] as string;
    const referer = request.headers.referer as string;

    await this.analyticsService.createClickLog({
      url_id: url.id,
      ip_address: ip,
      user_agent: userAgent,
      referer: referer,
      country: country,
    });
    return url.original_url;
  }
}
