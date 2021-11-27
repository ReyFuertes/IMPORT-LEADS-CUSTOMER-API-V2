import { sqlOp } from 'src/models/generic.model';
import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { Subscription } from './subscription.entity';
import { ISubscriptionDto } from './subscription.dto';

@EntityRepository(Subscription)
export class SubscriptionRepository extends Repository<Subscription> {

  async getSubscriptions(dto: any): Promise<ISubscriptionDto[]> {

    return ;
  }
}

