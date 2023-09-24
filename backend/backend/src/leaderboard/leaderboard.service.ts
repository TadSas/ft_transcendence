import { Injectable } from '@nestjs/common';

import { LeaderboardDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  showLeaderboard(dto: LeaderboardDto) {
    return { msg: "Showing the fresh leaderboard" };
  }
}
