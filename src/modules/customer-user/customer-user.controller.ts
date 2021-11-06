import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomerUserService } from './customer-user.service';

@Controller('customer-user')
export class CustomerUserController {
  constructor(private srv: CustomerUserService) { }

  // @Post()
  // create(@Body() dto: any, @Req() req: any): Promise<any> {
  //   return this.srv.createCustomerUser(dto);
  // }
}
