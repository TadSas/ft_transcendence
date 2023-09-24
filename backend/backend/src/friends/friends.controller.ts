import { Body, Controller, Post } from '@nestjs/common';

import { FriendsDto } from './dto';
import { FriendsService } from './friends.service';


@Controller('friends')
export class FriendController {
  constructor(private friendService: FriendsService) {}

  @Post('new')
  newFriend(@Body() dto: FriendsDto) {
    return this.friendService.newFriend(dto);
  }
}
