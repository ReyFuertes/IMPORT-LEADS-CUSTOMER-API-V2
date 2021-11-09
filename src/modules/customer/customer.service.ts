import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { ICustomerDto, ICustomerPayload, ICustomerResponse } from './customer.dto';
import { Customer } from './customer.entity';
import { CustomerRepository } from './customer.repository';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(@InjectRepository(CustomerRepository) public repo: CustomerRepository) {
    super(repo);
  }
 
  async getCustomerById(id: string): Promise<ICustomerDto> {
    return this.repo.getCustomerById(id);
  }

  async getCustomers(dto: any): Promise<any> {
    return this.repo.getCustomers(dto);
  }

  async updateCustomer(dto: ICustomerPayload): Promise<ICustomerDto> {
    return this.repo.updateCustomer(dto);
  }

  async createCustomer(dto: any): Promise<ICustomerResponse> {
    return this.repo.createCustomer(dto);
  }
}
