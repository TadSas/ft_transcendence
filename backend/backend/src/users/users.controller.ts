import { Body, Controller, Post } from '@nestjs/common';

import { UsersDto } from './dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('status')
  userStatus(@Body() dto: UsersDto) {
    return this.usersService.userStatus(dto);
  }
}
