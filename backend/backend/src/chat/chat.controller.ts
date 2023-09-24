import { Body, Controller, Post } from '@nestjs/common';

import { ChatDto } from './dto';
import { ChatService } from './chat.service';


@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('status')
  chatStatus(@Body() dto: ChatDto) {
    return this.chatService.chatStatus(dto);
  }
}
