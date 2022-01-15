import { sqlOp } from 'src/models/generic.model';
import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { Subscription } from './subscription.entity';
import { ISubscriptionDto } from './subscription.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@EntityRepository(Subscription)
export class SubscriptionRepository extends Repository<Subscription> {

  async deleteSubscriptionById(id: string): Promise<ISubscriptionDto> {
    const exist = await this.findOne({ id });
    if (exist) {
      this.createQueryBuilder()
        .delete()
        .from(Subscription)
        .where("id = :id", { id })
        .execute();
      return exist;
    }
    return null;
  }

  async updateSubscription(dto: ISubscriptionDto): Promise<ISubscriptionDto> {
    const exist = await this.findOne({ id: dto.id });
    if (exist) {
      return await this.save(dto);
    }
    return exist;
  }

  async getBySubscriptionId(id: string): Promise<ISubscriptionDto> {
    const query = this.createQueryBuilder('subscription');
    const result = await query
      .where("id = :id", { id })
      .getOne();

    if (!result) {
      throw new NotFoundException(`Subscription with ID "${id}" not found`);
    }
    return result;
  }

  async createSubscription(dto: any, req: any): Promise<ISubscriptionDto[]> {
    const exist = await this.findOne({ name: dto?.name });
    if (!exist) {
      return await this.save(dto);
    } else {
      throw new BadRequestException(`Subscription create failed.`);
    }
  }

  async getSubscriptions(dto: any): Promise<ISubscriptionDto[]> {
    const query = this.createQueryBuilder('subscription');
    const results = await query
      .select(['id', 'name', 'max_users', 'description', 'rate', 'is_default'])
      .orderBy('created_at', 'ASC')
      .getRawMany();

    return results;
  }
}



