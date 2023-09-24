import { Injectable } from '@nestjs/common';

import { ChatDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  chatStatus(dto: ChatDto) {
    return { msg: "I'm chatting" };
  }
}
