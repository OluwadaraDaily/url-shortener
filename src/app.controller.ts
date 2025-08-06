import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SkipThrottle()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-throttle')
  @UseGuards(ThrottlerGuard)
  testThrottle(): string {
    return 'OK';
  }
}
