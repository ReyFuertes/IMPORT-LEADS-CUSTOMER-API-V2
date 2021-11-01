import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { CustomerRole } from './customer-role.entity';
import { ICustomerRoleDto } from './customer-role.dto';
import { CustomerRoleRepository } from './customer-role.repository';

@Injectable()
export class CustomerRoleService extends BaseService<CustomerRole> {
  constructor(@InjectRepository(CustomerRoleRepository) public repo: CustomerRoleRepository) {
    super(repo);
  }

  async getById(id: string): Promise<number[]> {
    return this.repo.getById(id);
  }

  async saveCustomerRole(dto: any): Promise<ICustomerRoleDto> {
    return this.repo.saveCustomerRole(dto);
  }
}
