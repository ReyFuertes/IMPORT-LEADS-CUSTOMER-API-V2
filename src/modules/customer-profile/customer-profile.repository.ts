import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { CustomerProfile } from './customer-profile.entity';
import { NotFoundException } from '@nestjs/common';
import { ICustomerProfileDto } from './customer-profile.dto';

@EntityRepository(CustomerProfile)
export class CustomerProfileRepository extends Repository<CustomerProfile> {

  async updateProfile(dto: ICustomerProfileDto): Promise<ICustomerProfileDto> {
    const exist = await this.findOne({ id: dto.id });

    if (exist) {
      return await this.save(dto);
    }
    return exist;
  }

  async getByCustomerId(id: string): Promise<CustomerProfile> {
    const query = this.createQueryBuilder('customer_profile');
    const result = await query
      .innerJoinAndSelect('customer_profile.customer', 'customer')
      .where("customer_id = :id", { id })
      .getOne();

    if (!result) {
      throw new NotFoundException(`customer profile with ID "${id}" not found`);
    }
    return result;
  }

}


