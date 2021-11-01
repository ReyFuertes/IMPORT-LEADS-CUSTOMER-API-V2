
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { CustomerProfile } from './customer-profile.entity';
import { CustomerProfileRepository } from './customer-profile.repository';
import { ICustomerProfileDto } from './customer-profile.dto';

@Injectable()
export class CustomerProfileService extends BaseService<CustomerProfile> {
  constructor(@InjectRepository(CustomerProfileRepository) public repo: CustomerProfileRepository) {
    super(repo);
  }

  async updateProfile(dto: ICustomerProfileDto): Promise<ICustomerProfileDto> {
    return this.repo.updateProfile(dto);
  }

  async getByCustomerId(id: string): Promise<CustomerProfile> {
    return this.repo.getByCustomerId(id);
  }
}
