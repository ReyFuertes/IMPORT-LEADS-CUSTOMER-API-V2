import { sqlOp } from 'src/models/generic.model';
import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { CustomerSubscription } from './customer-subscription.entity';
import { ICustomerSubscriptionDto } from './customer-subscription.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@EntityRepository(CustomerSubscription)
export class CustomerSubscriptionRepository extends Repository<CustomerSubscription> {

  async deleteCustomerSubscriptionById(id: string): Promise<ICustomerSubscriptionDto> {
    const exist = await this.findOne({ id });
    if (exist) {
      this.createQueryBuilder()
        .delete()
        .from(CustomerSubscription)
        .where("id = :id", { id })
        .execute();
      return exist;
    }
    return null;
  }

  async updateCustomerSubscription(dto: ICustomerSubscriptionDto): Promise<ICustomerSubscriptionDto> {
    const exist = await this.findOne({ id: dto.id });
    if (exist) {
      return await this.save(dto);
    }
    return exist;
  }

  async getByCustomerSubscriptionId(id: string): Promise<ICustomerSubscriptionDto> {
    const query = this.createQueryBuilder('customer-subscription');
    const result = await query
      .where("id = :id", { id })
      .getOne();

    if (!result) {
      throw new NotFoundException(`Subscription with ID "${id}" not found`);
    }
    return result;
  }

  async createCustomerSubscription(dto: any, req: any): Promise<ICustomerSubscriptionDto[]> {
    const exist = await this.findOne({
      customer: { id: dto?.customer?.id }
    });
    if (!exist) {
      return await this.save(dto);
    } else {
      throw new BadRequestException(`Subscription create failed.`);
    }
  }

  async getCustomerSubscriptions(dto: any): Promise<ICustomerSubscriptionDto[]> {
    const query = this.createQueryBuilder('customer-subscription');
    const results = await query
      .select(['id', 'name', 'max_users', 'description', 'rate', 'is_default'])
      .orderBy('created_at', 'ASC')
      .getRawMany();

    return results;
  }
}



