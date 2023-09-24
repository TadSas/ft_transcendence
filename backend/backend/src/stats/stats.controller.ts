import { Body, Controller, Post } from '@nestjs/common';

import { StatsDto } from './dto';
import { StatsService } from './stats.service';


@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Post('calculate')
  calculate(@Body() dto: StatsDto) {
    return this.statsService.calculate(dto);
  }
}
