import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  original_url: string;

  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  short_code?: string;
}
