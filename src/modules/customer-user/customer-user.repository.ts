import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { CustomerUser } from './customer-user.entity';
import * as bcrypt from 'bcrypt';
import { AccessesRepository } from '../accesses/accesses.repository';
import { RolesRepository } from '../roles/roles.repository';
import { ProfileRepository } from '../profile/profile.repository';
import { ICustomerUserDto, ICustomerUserResponseDto } from './customer-user.dto';
import { IProfileDto } from '../profile/profile.dto';
import { BadRequestException } from '@nestjs/common';

@EntityRepository(CustomerUser)
export class CustomerUserRepository extends Repository<CustomerUser> {

  async updateCustomerUser(dto: ICustomerUserDto): Promise<ICustomerUserDto> {
    const roles_repo = getCustomRepository(RolesRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    let updated_customer_user: ICustomerUserDto;

    try {
      const existingCustomer = await this.findOne({ username: dto?.username });
      if (!existingCustomer) {
        throw new BadRequestException(`Customer already exist.`);
      }
      const customer_user = new CustomerUser();
      customer_user.id = existingCustomer?.id;
      customer_user.username = String(dto?.username).toLowerCase();
      if (dto?.password) {
        customer_user.salt = await bcrypt.genSalt();
        customer_user.password = await this.hashPassword(dto?.password, customer_user.salt);
        customer_user.text_password = dto?.password;
      }
      updated_customer_user = await this.save(customer_user);
    } catch (error) {
      throw new BadRequestException(`Customer user update failed: ${error}`);
    }

    try {
      const access_delete_result = await accesses_repo.find({
        where: {
          customer_user: { id: updated_customer_user?.id },
        },
        relations: ['customer_user']
      });
      await accesses_repo.delete(access_delete_result?.map(access => access?.id));

      const roles_delete_result = await roles_repo.find({
        where: {
          customer_user: { id: updated_customer_user?.id },
        },
        relations: ['customer_user']
      });
      await roles_repo.delete(roles_delete_result?.map(role => role?.id));
    } catch (error) {
      throw new BadRequestException(`Customer access/roles delete failed: ${error}`);
    }

    try {
      await Promise.all([dto?.accesses.forEach(async (id) => {
        let access_exist = await accesses_repo.findOne({
          where: {
            customer_user: { id: updated_customer_user?.id },
            access: { id }
          },
          relations: ['access']
        }) || {};
        Object.assign(access_exist, {
          access: { id },
          customer_user: { id: updated_customer_user?.id }
        });
        await accesses_repo.save(access_exist);
      })]);
    } catch (error) {
      throw new BadRequestException(`Customer user access failed: ${error}`);
    }

    try {
      await Promise.all([dto?.roles.forEach(async (id) => {
        const role_exist = await roles_repo.findOne({
          where: {
            customer_user: { id: updated_customer_user?.id },
            role: { id }
          },
          relations: ['role']
        }) || {};
        Object.assign(role_exist, {
          role: { id },
          customer_user: { id: updated_customer_user?.id }
        });
        await roles_repo.save(role_exist);
      })]);
    } catch (error) {
      throw new BadRequestException(`Customer user roles failed: ${error}`);
    }
    const response = this.getCustomerUserById(updated_customer_user?.id);
    return response;
  }

  public async deleteById(id: string): Promise<ICustomerUserDto> {
    const exist = await this.findOne({ id });
    if (exist) {
      this.createQueryBuilder()
        .delete()
        .from(CustomerUser)
        .where("id = :id", { id })
        .execute();
      return exist;
    }
    return null;
  }

  public async getCustomerUserById(id: string): Promise<ICustomerUserResponseDto> {
    const query = this.createQueryBuilder('customer_user');
    let customer_user: ICustomerUserDto = await query
      .select(['id', 'username', 'status', 'created_at'])
      .where("id = :id", { id: id })
      .orderBy('created_at', 'DESC')
      .getRawOne();

    const profile_repo = getCustomRepository(ProfileRepository);

    const profile_query = profile_repo.createQueryBuilder('profile');
    const customer_user_profile: IProfileDto = await profile_query
      .select(['id', 'firstname', 'lastname', 'language', 'phone', 'company_name', 'company_address', 'address'])
      .where("customer_id = :customer_id", { customer_id: customer_user?.id })
      .getRawOne();

    const roles_repo = getCustomRepository(RolesRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);
    const roles_result = await roles_repo.find({
      where: { customer_user: { id: customer_user?.id } },
      relations: ['role']
    });
    const accesses_result = await accesses_repo.find({
      where: { customer_user: { id: customer_user?.id } },
      relations: ['access']
    });
    const accesses = accesses_result.map(value => {
      return value?.access.id
    });
    const roles = roles_result?.map(value => {
      return value?.role?.id
    });
    return {
      ...customer_user,
      customer_user_profile,
      accesses,
      roles
    }
  }

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}


