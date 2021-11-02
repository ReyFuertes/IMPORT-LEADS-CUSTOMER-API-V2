import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ICustomerDto } from './customer.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private srv: CustomerService) { }

  @Get()
  getAll(@Query() dto: any): Promise<any[]> {
    return this.srv.getCustomers(dto);
  }

  @Post()
  create(@Body() dto: any, @Req() req: any): Promise<any> {
    return this.srv.createCustomer(dto);
  }

  @Patch()
  // @UseGuards(AuthGuard('jwt'))
  update(@Body() dto: ICustomerDto): Promise<void> {
    return this.srv.updateCustomer(dto);
  }
}
