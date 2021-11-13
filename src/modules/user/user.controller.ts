import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { IUserDto, GetUserDto } from './user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private srv: UserService) { }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string): Promise<IUserDto> {
    return this.srv.deleteById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: IUserDto, @Req() req: any): Promise<void> {
    return this.srv.createUser(dto, req?.user);
  }
}
