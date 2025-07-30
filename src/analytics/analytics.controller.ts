import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateClickLogsDto } from './dto/create-click-logs.dto';
import { UpdateClickLogsDto } from './dto/update-click-logs.dto';
import { ClickLogs } from './entities/click_logs.entity';
import { ApiError, ApiResponse } from 'src/common/types';

@Controller('api/click-logs')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  async createClickLog(
    @Body() createClickLogsDto: CreateClickLogsDto,
  ): Promise<ApiResponse<ClickLogs> | ApiError> {
    const response =
      await this.analyticsService.createClickLog(createClickLogsDto);
    if (!response) {
      return {
        status: 'error',
        statusCode: 404,
        message: 'Click log not found',
      };
    }
    return {
      status: 'success',
      statusCode: 201,
      message: 'Click log created successfully',
      data: response,
    };
  }

  @Get()
  async findAllClickLogs(): Promise<ApiResponse<ClickLogs[]> | ApiError> {
    try {
      const response = await this.analyticsService.findAllClickLogs();
      if (!response) {
        return {
          status: 'error',
          statusCode: 404,
          message: 'Click logs not found',
        };
      }
      return {
        status: 'success',
        statusCode: 200,
        message: 'Click logs fetched successfully',
        data: response,
      };
    } catch (error: any) {
      return {
        status: 'error',
        statusCode: 500,
        message: error.message || 'Failed to fetch click logs',
      };
    }
  }

  @Get(':id')
  async findOneClickLog(
    @Param('id') id: string,
  ): Promise<ApiResponse<ClickLogs> | ApiError> {
    try {
      const response = await this.analyticsService.findOneClickLog(id);
      if (!response) {
        return {
          status: 'error',
          statusCode: 404,
          message: 'Click log not found',
        };
      }
      return {
        status: 'success',
        statusCode: 200,
        message: 'Click log fetched successfully',
        data: response,
      };
    } catch (error: any) {
      return {
        status: 'error',
        statusCode: 500,
        message: error.message || 'Failed to fetch click log',
      };
    }
  }

  @Patch(':id')
  async updateClickLog(
    @Param('id') id: string,
    @Body() updateClickLogsDto: UpdateClickLogsDto,
  ): Promise<ApiResponse<ClickLogs> | ApiError> {
    try {
      const response = await this.analyticsService.updateClickLog(
        id,
        updateClickLogsDto,
      );
      if (!response) {
        return {
          status: 'error',
          statusCode: 404,
          message: 'Click log not found',
        };
      }

      return {
        status: 'success',
        statusCode: 200,
        message: 'Click log updated successfully',
        data: response,
      };
    } catch (error: any) {
      return {
        status: 'error',
        statusCode: 500,
        message: error.message || 'Failed to update click log',
      };
    }
  }

  @Delete(':id')
  async removeClickLog(
    @Param('id') id: string,
  ): Promise<ApiResponse<null> | ApiError> {
    try {
      const result = await this.analyticsService.removeClickLog(id);

      if (result.affected === 0) {
        return {
          status: 'error',
          statusCode: 404,
          message: `Click log with ID "${id}" not found`,
        };
      }

      return {
        status: 'success',
        statusCode: 200,
        message: 'Click log deleted successfully',
        data: null,
      };
    } catch (error: any) {
      return {
        status: 'error',
        statusCode: 500,
        message: error.message || 'Failed to delete click log',
      };
    }
  }
}
