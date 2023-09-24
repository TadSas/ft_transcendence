import { Body, Controller, Post } from '@nestjs/common';

import { PongDto } from './dto';
import { PongService } from './pong.service';


@Controller('pong')
export class PongController {
  constructor(private pongService: PongService) {}

  @Post('ping')
  ping(@Body() dto: PongDto) {
    return this.pongService.ping(dto);
  }
}
