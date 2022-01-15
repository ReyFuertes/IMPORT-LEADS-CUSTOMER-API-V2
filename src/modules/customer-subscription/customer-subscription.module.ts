import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CustomerSubscriptionRepository } from './customer-subscription.repository';
import { CustomerSubscriptionController } from './customer-subscription.controller';
import { CustomerSubscriptionService } from './customer-subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerSubscriptionRepository])],
  controllers: [CustomerSubscriptionController],
  providers: [CustomerSubscriptionService]
})
export class CustomerSubscriptionModule {}
