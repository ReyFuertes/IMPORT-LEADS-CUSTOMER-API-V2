import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { CustomerUser } from './customer-user.entity';
import * as bcrypt from 'bcrypt';
import { AccessesRepository } from '../accesses/accesses.repository';
import { RolesRepository } from '../roles/roles.repository';
import { ProfileRepository } from '../profile/profile.repository';
import { ICustomerUserDto, ICustomerUserResponseDto } from './customer-user.dto';
import { IProfileDto } from '../profile/profile.dto';

@EntityRepository(CustomerUser)
export class CustomerUserRepository extends Repository<CustomerUser> {

  async deleteById(id: string): Promise<ICustomerUserDto> {
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

  async getCustomerUserById(id: string): Promise<ICustomerUserResponseDto> {
    const query = this.createQueryBuilder('customer_user');
    let customer_user: ICustomerUserDto = await query
      .select(['id', 'username', 'status', 'created_at'])
      .where("id = :id", { id: id })
      .orderBy('created_at', 'DESC')
      .getRawOne();

    const profile_repo = getCustomRepository(ProfileRepository);

    const profile_query = profile_repo.createQueryBuilder('profile');
    const customer_user_profile: IProfileDto = await profile_query
      .select(['id', 'firstname', 'lastname', 'language', 'phone_number', 'company_name', 'company_address', 'address'])
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


