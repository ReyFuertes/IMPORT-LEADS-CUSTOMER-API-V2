import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { CustomerUpdateStatus, ICustomerDto, ICustomerPayload, ICustomerResponseDto } from './customer.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private srv: CustomerService) { }

  @Patch('reset-status')
  resetStatus(@Body() dto: CustomerUpdateStatus): Promise<ICustomerDto> {
    return this.srv.resetStatus(dto);
  }

  @Post('onboard')
  onboardCustomer(@Body() dto: any, @Req() req: any): Promise<ICustomerResponseDto> {
    return this.srv.onboardCustomer(dto);
  }

  @Get('/:id/invited')
  isInvited(@Param('id') id: string): Promise<ICustomerResponseDto> {
    return this.srv.isInvited(id);
  }

  @Post('invite')
  onInvite(@Body() dto: ICustomerDto[], @Req() req: any): Promise<ICustomerDto[]> {
    return this.srv.onInvite(dto);
  }

  @Patch('status')
  updateStatus(@Body() dto: CustomerUpdateStatus): Promise<ICustomerDto> {
    return this.srv.updateStatus(dto);
  }

  @Delete('/:id')
  delete(@Param('id') id: string): Promise<ICustomerDto> {
    return this.srv.deleteById(id);
  }

  @Get('/:id')
  getCustomerById(@Param('id') id: string): Promise<ICustomerResponseDto> {
    return this.srv.getCustomerById(id);
  }

  @Get()
  getAll(@Query() dto: any): Promise<any[]> {
    return this.srv.getCustomers(dto);
  }

  @Post()
  create(@Body() dto: ICustomerPayload, @Req() req: any): Promise<ICustomerResponseDto> {
    return this.srv.createCustomer(dto);
  }

  @Patch()
  update(@Body() dto: ICustomerPayload): Promise<ICustomerResponseDto> {
    return this.srv.updateCustomer(dto);
  }
}
