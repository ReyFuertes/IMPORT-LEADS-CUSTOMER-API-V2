import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ICustomerDto, ICustomerPayload, ICustomerResponse } from './customer.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private srv: CustomerService) { }

  @Get('/:id')
  getCustomerById(@Param('id') id: string): Promise<ICustomerDto> {
    return this.srv.getCustomerById(id);
  }

  @Get()
  getAll(@Query() dto: any): Promise<any[]> {
    return this.srv.getCustomers(dto);
  }

  @Post()
  create(@Body() dto: any, @Req() req: any): Promise<ICustomerResponse> {
    return this.srv.createCustomer(dto);
  }

  @Patch()
  update(@Body() dto: ICustomerPayload): Promise<ICustomerDto> {
    return this.srv.updateCustomer(dto);
  }
}
