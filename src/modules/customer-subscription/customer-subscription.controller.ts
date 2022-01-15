import { Controller, Get, Post, Body, Param, UseGuards, Query, Req, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetCustomerSubscriptionDto, ICustomerSubscriptionDto } from './customer-subscription.dto';
import { CustomerSubscriptionService } from './customer-subscription.service';

@Controller('customer-subscription')
export class CustomerSubscriptionController {
  constructor(private srv: CustomerSubscriptionService) { }

  @Delete('/:id')
  deleteCustomerSubscriptionById(@Param('id') id: string): Promise<ICustomerSubscriptionDto> {
    return this.srv.deleteCustomerSubscriptionById(id);
  }
  
  @Patch()
  updateCustomerSubscription(@Body() dto: ICustomerSubscriptionDto): Promise<ICustomerSubscriptionDto> {
    return this.srv.updateCustomerSubscription(dto);
  }

  @Get('/:id')
  getByCustomerSubscriptionId(@Param('id') id: string): Promise<ICustomerSubscriptionDto> {
    return this.srv.getByCustomerSubscriptionId(id);
  }

  @Post()
  createCustomerSubscription(@Body() dto: any, @Req() req: any): Promise<ICustomerSubscriptionDto[]> {
    return this.srv.createCustomerSubscription(dto, req?.user);
  }

  @Get()
  getAllCustomerSubscription(@Query() dto: GetCustomerSubscriptionDto): Promise<ICustomerSubscriptionDto[]> {
    return this.srv.getCustomerSubscriptions(dto);
  }

}
