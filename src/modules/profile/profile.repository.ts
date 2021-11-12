import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { Profile } from './profile.entity';
import { NotFoundException } from '@nestjs/common';
import { IProfileDto } from './profile.dto';

@EntityRepository(Profile)
export class ProfileRepository extends Repository<Profile> {

  async updateProfile(dto: IProfileDto): Promise<IProfileDto> {
    const exist = await this.findOne({ id: dto.id });

    if (exist) {
      return await this.save(dto);
    }
    return exist;
  }

  async getByCustomerId(id: string): Promise<Profile> {
    const query = this.createQueryBuilder('profile');
    const result = await query
      .innerJoinAndSelect('profile.customer', 'customer')
      .where("customer_id = :id", { id })
      .getOne();

    if (!result) {
      throw new NotFoundException(`customer profile with ID "${id}" not found`);
    }
    return result;
  }

}


