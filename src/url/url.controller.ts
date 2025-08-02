import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Redirect,
  Req,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { ApiError, ApiResponse } from 'src/common/types';
import { Url } from './entities/url.entity';
import { Request as ExpressRequest } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('api/url')
@UseGuards(ThrottlerGuard)
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @Throttle({ default: { ttl: 3600000, limit: 50 } }) // 50 requests per hour
  async create(
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<ApiResponse<Url> | ApiError> {
    const response = await this.urlService.create(createUrlDto);
    if (!response) {
      return {
        status: 'error',
        statusCode: 404,
        message: 'Url not found',
      };
    }
    return {
      status: 'success',
      statusCode: 201,
      message: 'Url created successfully',
      data: response,
    };
  }

  @Get()
  @Throttle({ default: { ttl: 60000, limit: 100 } }) // 100 requests per minute
  async findAll(): Promise<ApiResponse<Url[]> | ApiError> {
    const response = await this.urlService.findAll();
    if (!response) {
      return {
        status: 'error',
        statusCode: 404,
        message: 'Urls not found',
      };
    }
    return {
      status: 'success',
      message: 'Urls fetched successfully',
      statusCode: 200,
      data: response,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Url> | ApiError> {
    const response = await this.urlService.findOne(id);
    if (!response) {
      return {
        status: 'error',
        statusCode: 404,
        message: 'Url not found',
      };
    }
    return {
      status: 'success',
      statusCode: 200,
      message: 'Url fetched successfully',
      data: response,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
  ): Promise<ApiResponse<Url> | ApiError> {
    const response = await this.urlService.update(id, updateUrlDto);
    if (!response) {
      return {
        status: 'error',
        statusCode: 404,
        message: 'Url not found',
      };
    }
    return {
      status: 'success',
      statusCode: 200,
      message: 'Url updated successfully',
      data: response,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ApiResponse<{ message: string }> | ApiError> {
    const response = await this.urlService.remove(id);
    if (!response) {
      return {
        status: 'error',
        statusCode: 404,
        message: 'Url not found',
      };
    }
    return {
      status: 'success',
      statusCode: 200,
      message: 'Url deleted successfully',
      data: response,
    };
  }
}

@Controller()
@UseGuards(ThrottlerGuard)
export class UrlRedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':shortCode')
  @Throttle({ default: { ttl: 60000, limit: 50 } })
  @Redirect()
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() request: ExpressRequest,
    @Ip() ip: string,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.urlService.redirectUrl(shortCode, request, ip);
    if (!url) {
      throw new NotFoundException('Url not found');
    }
    return {
      url: url,
      statusCode: 302,
    };
  }
}
