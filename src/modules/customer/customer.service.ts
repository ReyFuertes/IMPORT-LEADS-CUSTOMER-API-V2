import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { ICustomerDto } from './customer.dto';
import { Customer } from './customer.entity';
import { CustomerRepository } from './customer.repository';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(@InjectRepository(CustomerRepository) public repo: CustomerRepository) {
    super(repo);
  }

  async getCustomers(dto: any): Promise<any> {
    return this.repo.getCustomers(dto);
  }

  async updateCustomer(dto: ICustomerDto): Promise<void> {
    return this.repo.updateCustomer(dto);
  }

  async createCustomer(dto: any): Promise<any> {
    return this.repo.createCustomer(dto);
  }
}
