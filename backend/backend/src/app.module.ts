import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { PongModule } from './pong/pong.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { FriendsModule } from './friends/friends.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';


@Module({
  imports: [
    AuthModule,
    ChatModule,
    PongModule,
    StatsModule,
    UsersModule,
    PrismaModule,
    FriendsModule,
    LeaderboardModule
  ],
})
export class AppModule {}
