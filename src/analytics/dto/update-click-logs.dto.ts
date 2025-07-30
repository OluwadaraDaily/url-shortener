import { PartialType } from '@nestjs/mapped-types';
import { CreateClickLogsDto } from './create-click-logs.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClickLogsDto extends PartialType(CreateClickLogsDto) {
  @IsOptional()
  @IsString()
  url_id?: string;

  @IsString()
  @IsOptional()
  referer?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  user_agent?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
