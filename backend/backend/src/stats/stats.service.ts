import { Injectable } from '@nestjs/common';

import { StatsDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  calculate(dto: StatsDto) {
    return { msg: "Stats calculating..." };
  }
}
