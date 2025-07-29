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
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { ApiError, ApiResponse } from 'src/common/types';
import { Url } from './entities/url.entity';

@Controller('api/url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
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
export class UrlRedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':shortCode')
  @Redirect()
  async redirect(
    @Param('shortCode') shortCode: string,
  ): Promise<{ url: string; statusCode: number }> {
    console.log('shortCode =>', shortCode);
    const url = await this.urlService.redirectUrl(shortCode);
    if (!url) {
      throw new NotFoundException('Url not found');
    }
    return {
      url: url,
      statusCode: 302,
    };
  }
}
