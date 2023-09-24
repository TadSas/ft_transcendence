import { Body, Controller, Post } from '@nestjs/common';

import { LeaderboardDto } from './dto';
import { LeaderboardService } from './leaderboard.service';


@Controller('leaderborad')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Post('show')
  showLeaderboard(@Body() dto: LeaderboardDto) {
    return this.leaderboardService.showLeaderboard(dto);
  }
}
