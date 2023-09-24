import { Injectable } from '@nestjs/common';

import { UsersDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  userStatus(dto: UsersDto) {
    return { msg: "User is online" };
  }
}
