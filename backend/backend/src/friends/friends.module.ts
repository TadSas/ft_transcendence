import { Module } from '@nestjs/common';

import { FriendsService } from './friends.service';
import { FriendController } from './friends.controller';


@Module({
  providers: [FriendsService],
  controllers: [FriendController],
})
export class FriendsModule {}
