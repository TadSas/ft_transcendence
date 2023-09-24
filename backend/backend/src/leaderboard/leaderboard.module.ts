import { Module } from '@nestjs/common';

import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderbord.controller';


@Module({
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
})
export class LeaderboardModule {}
