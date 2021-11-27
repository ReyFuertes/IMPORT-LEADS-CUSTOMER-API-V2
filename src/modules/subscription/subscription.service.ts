import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { GetSubscriptionDto, ISubscriptionDto } from './subscription.dto';
import { Subscription } from './subscription.entity';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService extends BaseService<Subscription> {
  constructor(@InjectRepository(SubscriptionRepository) public repo: SubscriptionRepository) {
    super(repo);
  }

  async getSubscriptions(dto: GetSubscriptionDto): Promise<ISubscriptionDto[]> {
    return this.repo.getSubscriptions(dto)
  }
}
