import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Patch, Query, Res, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { AuthCredentialDto } from './auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IUserDto } from '../user/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private srv: AuthService) { }

  @Post('/signin')
  signIn(@Body(ValidationPipe) dto: AuthCredentialDto): Promise<any> {
    return this.srv.signIn(dto)
  }

  @Post('/signup')
  signUp(@Body(ValidationPipe) dto: AuthCredentialDto, @Req() req: any): Promise<void> {
    return this.srv.signUp(dto, req?.customer)
  }
}
