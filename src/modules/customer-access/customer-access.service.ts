import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { CustomerAccessRepository } from './customer-access.repository';
import { ICustomerAccessDto } from './customer-access.dto';
import { CustomerAccess } from './customer-access.entity';

@Injectable()
export class CustomerAccessService extends BaseService<CustomerAccess> {
  constructor(@InjectRepository(CustomerAccessRepository) public repo: CustomerAccessRepository) {
    super(repo);
  }

  async getById(id: string): Promise<string[]> {
    return this.repo.getById(id);
  }

  async saveCustomerAccess(dto: ICustomerAccessDto): Promise<ICustomerAccessDto[]> {
    return this.repo.saveCustomerAccess(dto);
  }
}
