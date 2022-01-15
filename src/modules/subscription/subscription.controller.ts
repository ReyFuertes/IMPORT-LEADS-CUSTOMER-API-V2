import { Controller, Get, Post, Body, Param, UseGuards, Query, Req, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetSubscriptionDto, ISubscriptionDto } from './subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private srv: SubscriptionService) { }

  @Delete('/:id')
  deleteSubscriptionById(@Param('id') id: string): Promise<ISubscriptionDto> {
    return this.srv.deleteSubscriptionById(id);
  }
  
  @Patch()
  updateSubscription(@Body() dto: ISubscriptionDto): Promise<ISubscriptionDto> {
    return this.srv.updateSubscription(dto);
  }

  @Get('/:id')
  getBySubscriptionId(@Param('id') id: string): Promise<ISubscriptionDto> {
    return this.srv.getBySubscriptionId(id);
  }

  @Post()
  createSubscription(@Body() dto: any, @Req() req: any): Promise<ISubscriptionDto[]> {
    return this.srv.createSubscription(dto, req?.user);
  }

  @Get()
  getAll(@Query() dto: GetSubscriptionDto): Promise<ISubscriptionDto[]> {
    return this.srv.getSubscriptions(dto);
  }

}
