import { Injectable } from '@nestjs/common';

import { FriendsDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  newFriend(dto: FriendsDto) {
    return { msg: "Wave to a new friend" };
  }
}
