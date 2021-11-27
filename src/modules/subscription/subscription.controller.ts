import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetSubscriptionDto, ISubscriptionDto } from './subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
export class RolesController {
  constructor(private srv: SubscriptionService) { }

  @Get()
  getAll(@Query() dto: GetSubscriptionDto): Promise<ISubscriptionDto[]> {
    return this.srv.getSubscriptions(dto);
  }

}
