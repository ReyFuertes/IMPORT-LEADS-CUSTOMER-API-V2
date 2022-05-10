import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { ICustomerUserDto, ICustomerUserResponseDto } from './customer-user.dto';
import { CustomerUser } from './customer-user.entity';
import { CustomerUserRepository } from './customer-user.repository';

@Injectable()
export class CustomerUserService extends BaseService<CustomerUser> {
  constructor(@InjectRepository(CustomerUserRepository) public repo: CustomerUserRepository) {
    super(repo);
  }

  async updateCustomerUser(dto: ICustomerUserDto): Promise<ICustomerUserDto> {
    return this.repo.updateCustomerUser(dto);
  }

  async deleteById(id: string): Promise<ICustomerUserDto> {
    return await this.repo.deleteById(id);
  }

  async getCustomerUserById(id: string): Promise<ICustomerUserResponseDto> {
    return this.repo.getCustomerUserById(id);
  }
}
