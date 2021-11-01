import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Patch, Query, Res, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { AuthCredentialDto, ICustomerAuthDto } from './auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth-service';

@Controller('auth')
export class AuthController {
  constructor(private srv: AuthService) { }

  @Post('/signin')
  signIn(@Body(ValidationPipe) dto: AuthCredentialDto): Promise<ICustomerAuthDto> {
    return this.srv.signIn(dto)
  }

  @Post('/signup')
  @UseGuards(AuthGuard('jwt'))
  signUp(@Body(ValidationPipe) dto: AuthCredentialDto, @Req() req: any): Promise<any[]> {
    return this.srv.signUp(dto, req?.customer)
  }
}
