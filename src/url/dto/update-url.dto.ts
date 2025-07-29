import { PartialType } from '@nestjs/mapped-types';
import { CreateUrlDto } from './create-url.dto';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateUrlDto extends PartialType(CreateUrlDto) {
  @IsOptional()
  @IsString()
  original_url?: string;

  @IsOptional()
  @IsString()
  short_code?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDate()
  created_at?: Date;
}
