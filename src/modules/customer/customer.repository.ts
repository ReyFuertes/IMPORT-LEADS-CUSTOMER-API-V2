import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { AccessesRepository } from '../accesses/accesses.repository';
import { RolesRepository } from '../roles/roles.repository';
import { ProfileRepository } from '../profile/profile.repository';
import * as bcrypt from 'bcrypt';
import { Customer } from './customer.entity';
import { CustomerStatusType, CustomerUpdateStatus, ICustomerDto, ICustomerPayload, ICustomerResponseDto } from './customer.dto';
import { BadRequestException } from '@nestjs/common';
import { IProfileDto } from '../profile/profile.dto';
import { CustomerUser } from '../customer-user/customer-user.entity';
import { ICustomerUserDto } from '../customer-user/customer-user.dto';
import { CustomerUserRepository } from '../customer-user/customer-user.repository';
import { sqlOp } from 'src/models/generic.model';
import { Profile } from '../profile/profile.entity';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {

  async updateStatus(dto: CustomerUpdateStatus): Promise<ICustomerDto> {
    const exist = await this.findOne({ username: dto?.customer?.username });
    if (exist && exist.status === CustomerStatusType.Pending) {
      const updatedCustomer = await this.save({ ...exist, status: CustomerStatusType.Approved });
      return {
        id: updatedCustomer?.id,
        status: updatedCustomer?.status,
        username: updatedCustomer?.username
      };
    } else {
      throw new BadRequestException('Update status failed.');
    }
  }

  async deleteById(id: string): Promise<ICustomerDto> {
    const exist = await this.findOne({ id });
    if (exist) {
      this.createQueryBuilder()
        .delete()
        .from(CustomerUser)
        .where("id = :id", { id })
        .execute();
      delete exist?.password;
      delete exist?.salt;
      return exist;
    }
    return null;
  }

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async createCustomer(dto: any): Promise<ICustomerResponseDto> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    let new_customer: ICustomerDto;
    try {
      const { username, password } = dto?.email_password;
      const customer = new Customer();
      customer.username = String(username).toLowerCase();
      customer.salt = await bcrypt.genSalt();
      customer.password = await this.hashPassword(password, customer.salt);
      customer.status = CustomerStatusType.Pending;
      new_customer = await this.save(customer);

      const { address, company_address, company_name, firstname, lastname, phone_number, language } = dto?.profile;
      await profile_repo.save({
        address,
        company_address,
        company_name,
        firstname,
        lastname,
        phone_number,
        email: new_customer?.username,
        customer: new_customer,
        language
      });

      await Promise.all([dto?.users?.forEach(async (customer_user_info: ICustomerUserDto) => {
        const customer_user = new CustomerUser();
        customer_user.username = String(customer_user_info?.username).toLowerCase();
        customer_user.salt = await bcrypt.genSalt();
        customer_user.password = await this.hashPassword(customer_user_info?.password, customer_user.salt);
        const new_customer_user = await customer_user_repo.save({
          ...customer_user,
          customer: new_customer
        });
        /* profile */
        await profile_repo.save({
          email: customer_user_info?.username,
          language,
          customer_user: new_customer_user,
        });
        /* access */
        const access = customer_user_info?.accesses?.map(access => {
          return { customer_user: new_customer_user, access }
        });
        await accesses_repo.save(access);
        /* roles */
        const roles = customer_user_info?.roles?.map(role => {
          return { customer_user: new_customer_user, role }
        });
        await roles_repo.save(roles);
      })]);

    } catch (error) {
      throw new BadRequestException(`Customer failed: ${error}`);
    }
    return await this.getCustomerById(new_customer?.id);
  }

  async getCustomerById(id: string): Promise<ICustomerResponseDto> {
    const query = this.createQueryBuilder('customer');
    let result: ICustomerDto = await query
      .select(['id', 'username', 'status', 'created_at'])
      .where("id = :id", { id: id })
      .orderBy('customer.created_at', 'DESC')
      .getRawOne();

    const profile_repo = getCustomRepository(ProfileRepository);

    const profile_query = profile_repo.createQueryBuilder('profile');
    const profile: IProfileDto = await profile_query
      .select(['id', 'firstname', 'lastname', 'language', 'phone_number', 'company_name', 'company_address', 'address'])
      .where("customer_id = :customer_id", { customer_id: result?.id })
      .getRawOne();

    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const customer_user_query = customer_user_repo.createQueryBuilder('customer_user');
    let customer_users: ICustomerUserDto[] = await customer_user_query
      .select(['id', 'username', 'status'])
      .where("customer_id = :customer_id", { customer_id: result?.id })
      .getRawMany();

    const roles_repo = getCustomRepository(RolesRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);
    customer_users = await Promise.all(customer_users.map(async (cust_user) => {
      const roles_result = await roles_repo.find({
        where: { customer_user: { id: cust_user?.id } },
        relations: ['role']
      });
      const accesses_result = await accesses_repo.find({
        where: { customer_user: { id: cust_user?.id } },
        relations: ['access']
      });
      const accesses = accesses_result.map(value => {
        return value?.access.id
      });
      const roles = roles_result?.map(value => {
        return value?.role?.id
      })
      return {
        ...cust_user,
        accesses,
        roles
      }
    }));

    return {
      ...result,
      profile,
      customer_users
    }
  }

  async getCustomers(dto?: any): Promise<any[]> {
    const query = this.createQueryBuilder('customer')
      .select(['customer.id', 'customer.username', 'customer.status', 'customer.created_at'])
      .leftJoinAndMapOne(
        "customer.profile",
        Profile,
        "profile",
        "profile.customer_id = customer.id"
      ).orderBy('customer.created_at', 'DESC');

    const where = dto;
    const page = Object.assign({}, {
      take: dto?.take,
      skip: dto?.skip
    });
    delete where?.skip;
    delete where?.take;

    try {
      Object.entries(where)?.forEach(c => {
        const obj = Object.assign({}, Object.entries(c)
          .reduce((acc, [k, v]) => ({ ...acc, [c[0]]: `%${v}%` }), {})
        );
        query.orWhere(`${Object.keys(obj)} ${sqlOp.iLike} :${Object.keys(obj)}`, obj)
      });
    } catch (error) {
      throw new BadRequestException();
    }
    if (page?.skip) {
      query.skip(page?.skip)
    }
    if (page?.take) {
      query.take(page?.take)
    }

    let results: ICustomerDto[] = await query.getMany();

    const response = await Promise.all(results.map(async (customer) => {
      const customer_user_repo = getCustomRepository(CustomerUserRepository);
      const customer_user_query = customer_user_repo.createQueryBuilder('customer_user');
      const customer_users: ICustomerUserDto[] = await customer_user_query
        .select(['id', 'username', 'status'])
        .where("customer_id = :customer_id", { customer_id: customer?.id })
        .getRawMany();

      return {
        ...customer,
        customer_users
      }
    }));
    return response;
  }

  async updateCustomer(dto: ICustomerPayload): Promise<ICustomerDto> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    let customer_to_update: ICustomerDto;
    try {
      const { username, password } = dto?.email_password;
      const customer = new Customer();
      customer.id = dto?.id;
      customer.username = String(username).toLowerCase();
      if (password) {
        customer.salt = await bcrypt.genSalt();
        customer.password = await this.hashPassword(password, customer.salt);
      }
      customer.status = CustomerStatusType.Pending;
      customer_to_update = await this.save(customer);

      const { id, address, company_address, company_name, firstname, lastname, phone_number, language } = dto?.profile;
      await profile_repo.save({
        id,
        address,
        company_address,
        company_name,
        firstname,
        lastname,
        phone_number,
        email: customer_to_update?.username,
        customer: customer_to_update,
        language
      });

      try {
        await Promise.all([dto?.users?.forEach(async (customer_user_info: ICustomerUserDto) => {
          const customer_user = new CustomerUser();
          if (customer_user_info?.id) {
            customer_user.id = customer_user_info?.id;
          }
          customer_user.username = String(customer_user_info?.username).toLowerCase();
          const updated_customer_user = await customer_user_repo.save({
            ...customer_user,
            customer: { id: customer_to_update?.id }
          });

          /* profile */
          const customer_user_profile = await profile_repo.findOne({ customer_user: { id: updated_customer_user?.id } });
          const updated_profile = {
            ...customer_user_profile,
            email: customer_user_info?.username,
            language,
            customer_user: updated_customer_user,
          }
          await profile_repo.save(updated_profile);

          /* access */
          const accesses_exist = await accesses_repo.find({
            where: { customer_user: updated_customer_user }
          });
          if (accesses_exist?.length > 0) {
            await accesses_repo.delete({ customer_user: updated_customer_user });
          }
          const access = customer_user_info?.accesses?.map(access => {
            return { customer_user: updated_customer_user, access }
          });
          if (access) {
            await accesses_repo.save(access);
          }

          /* roles */
          const roles_exist = await roles_repo.find({
            where: { customer_user: updated_customer_user }
          });
          if (roles_exist?.length > 0) {
            await roles_repo.delete({ customer_user: updated_customer_user });
          }
          const roles = customer_user_info?.roles?.map(role => {
            return { customer_user: updated_customer_user, role }
          });
          if (roles) {
            await roles_repo.save(roles);
          }
        })]);
      } catch (error) {
        throw new BadRequestException(`Customer user update failed: ${error}`);
      }

    } catch (error) {
      throw new BadRequestException(`Customer update failed: ${error}`);
    }

    return await this.getCustomerById(customer_to_update?.id);
  }

  async getRolessByCustomerId(customer_id: string): Promise<any[]> {
    const repo = getCustomRepository(RolesRepository);
    const query = repo.createQueryBuilder('customer_role');
    const results: any[] = await query
      .innerJoinAndSelect('customer_role.role', 'role.customer_role')
      .where("customer_id = :customer_id", { customer_id })
      .getMany();

    return results;
  }
}


