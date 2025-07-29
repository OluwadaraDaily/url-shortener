import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import * as crypto from 'crypto';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}
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

  async update(id: string, updateUrlDto: UpdateUrlDto) {
    await this.urlRepository.update(id, updateUrlDto);
    return await this.urlRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.urlRepository.delete(id);
    return { message: 'Url deleted successfully' };
  }
}
