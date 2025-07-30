import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClickLogsDto {
  @IsNotEmpty()
  @IsString()
  url_id: string;

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
