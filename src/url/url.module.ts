import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController, UrlRedirectController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  controllers: [UrlController, UrlRedirectController],
  providers: [UrlService],
})
export class UrlModule {}
