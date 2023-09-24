import { Injectable } from '@nestjs/common';

import { PongDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class PongService {
  constructor(private prisma: PrismaService) {}

  ping(dto: PongDto) {
    return { msg: "ping" };
  }
}
