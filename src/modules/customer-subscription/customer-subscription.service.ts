import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { GetCustomerSubscriptionDto, ICustomerSubscriptionDto } from './customer-subscription.dto';
import { CustomerSubscription } from './customer-subscription.entity';
import { CustomerSubscriptionRepository } from './customer-subscription.repository';

@Injectable()
export class CustomerSubscriptionService extends BaseService<CustomerSubscription> {
  constructor(@InjectRepository(CustomerSubscriptionRepository) public repo: CustomerSubscriptionRepository) {
    super(repo);
  }
  
  async deleteCustomerSubscriptionById(id: string): Promise<ICustomerSubscriptionDto> {
    return await this.repo.deleteCustomerSubscriptionById(id);
  }
  
  async updateCustomerSubscription(dto: ICustomerSubscriptionDto): Promise<ICustomerSubscriptionDto> {
    return this.repo.updateCustomerSubscription(dto);
  }

  async getByCustomerSubscriptionId(id: string): Promise<ICustomerSubscriptionDto> {
    return this.repo.getByCustomerSubscriptionId(id);
  }

  async createCustomerSubscription(dto: any, req: any): Promise<ICustomerSubscriptionDto[]> {
    return this.repo.createCustomerSubscription(dto, req)
  }

  async getCustomerSubscriptions(dto: GetCustomerSubscriptionDto): Promise<ICustomerSubscriptionDto[]> {
    return this.repo.getCustomerSubscriptions(dto)
  }
}
