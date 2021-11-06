import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { CustomerUser } from './customer-user.entity';
import { CustomerUserRepository } from './customer-user.repository';

@Injectable()
export class CustomerUserService extends BaseService<CustomerUser> {
  constructor(@InjectRepository(CustomerUserRepository) public repo: CustomerUserRepository) {
    super(repo);
  }

  // async createCustomerUser(dto: any): Promise<any> {
  //   return this.repo.createCustomerUser(dto);
  // }
}
