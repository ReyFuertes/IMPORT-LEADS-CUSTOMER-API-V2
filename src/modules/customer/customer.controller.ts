import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomerUpdateStatus, ICustomerDto, ICustomerPayload, ICustomerResponseDto } from './customer.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private srv: CustomerService) { }

  @Post('/check-api-url')
  @UseGuards(AuthGuard('jwt'))
  isApiUrlExist(@Body() dto: any): Promise<boolean> {
    return this.srv.isApiUrlExist(dto);
  }

  @Post('/check-website-url')
  @UseGuards(AuthGuard('jwt'))
  isWebsiteUrlExist(@Body() dto: any): Promise<boolean> {
    return this.srv.isWebsiteUrlExist(dto);
  }

  @Patch('reset-status')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  onInvite(@Body() dto: ICustomerDto[], @Req() req: any): Promise<ICustomerDto[]> {
    return this.srv.onInvite(dto);
  }

  @Patch('status')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(@Body() dto: CustomerUpdateStatus): Promise<ICustomerDto> {
    return this.srv.updateStatus(dto);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: ICustomerPayload, @Req() req: any): Promise<ICustomerResponseDto> {
    return this.srv.createCustomer(dto);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  update(@Body() dto: ICustomerPayload): Promise<ICustomerResponseDto> {
    return this.srv.updateCustomer(dto);
  }
}
