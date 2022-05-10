import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ICustomerUserDto, ICustomerUserResponseDto } from './customer-user.dto';
import { CustomerUserService } from './customer-user.service';

@Controller('customer-user')
export class CustomerUserController {
  constructor(private srv: CustomerUserService) { }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  update(@Body() dto: ICustomerUserDto): Promise<ICustomerUserDto> {
    return this.srv.updateCustomerUser(dto);
  }

  @Delete('/:id')
  delete(@Param('id') id: string): Promise<ICustomerUserDto> {
    return this.srv.deleteById(id);
  }

  @Get('/:id')
  getCustomerUserById(@Param('id') id: string): Promise<ICustomerUserResponseDto> {
    return this.srv.getCustomerUserById(id);
  }
}
