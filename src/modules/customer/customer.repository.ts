import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { IAccessesDto } from '../accesses/accesses.dto';
import { AccessesRepository } from '../accesses/accesses.repository';
import { RolesRepository } from '../roles/roles.repository';
import { IRoleDto } from '../role/role.dto';
import { IRolesDto } from '../roles/roles.dto';
import { ProfileRepository } from '../profile/profile.repository';
import * as bcrypt from 'bcrypt';
import { Customer } from './customer.entity';
import { CustomerStatusType, ICustomerDto } from './customer.dto';
import { BadRequestException } from '@nestjs/common';
import { RolesType } from 'src/models/generic.model';
import { IProfileDto } from '../profile/profile.dto';
import { CustomerUser } from '../customer-user/customer-user.entity';
import { ICustomerUserDto } from '../customer-user/customer-user.dto';
import { CustomerUserRepository } from '../customer-user/customer-user.repository';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async createCustomer(dto: any): Promise<ICustomerDto> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    let new_customer: ICustomerDto;
    let new_customer_profile: IProfileDto;
    // try {
    const { username, password } = dto?.email_password;
    const customer = new Customer();
    customer.username = String(username).toLowerCase();
    customer.salt = await bcrypt.genSalt();
    customer.password = await this.hashPassword(password, customer.salt);
    customer.status = CustomerStatusType.Pending;
    new_customer = await this.save(customer);

    const { address, company_address, company_name, firstname, lastname, phone_number, language } = dto?.customer_information;
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
      const new_customer_user = await customer_user_repo.save(customer_user);
      /* profile */
      await profile_repo.save({
        email: customer_user_info?.username,
        language,
        customer_user: new_customer_user,
      });
      /* access */
      const access = customer_user_info?.access?.map(access => {
        return { customer_user: new_customer_user, access }
      });
      await accesses_repo.save(access);
      /* roles */
      const roles = customer_user_info?.roles?.map(role => {
        return { customer_user: new_customer_user, role }
      });
      await roles_repo.save(roles);
    })]);

    // } catch (error) {
    //   throw new BadRequestException(`Customer failed: ${error}`);
    // }
    return {

    };
  }

  async getCustomers(dto?: any): Promise<ICustomerDto[]> {
    const query = this.createQueryBuilder('customer');
    let results: ICustomerDto[] = await query
      .orderBy('customer.created_at', 'DESC')
      .getMany();
    return results;
  }


  async updateCustomer(dto: ICustomerDto): Promise<void> {
    // const customer = await this.findOne({ id: dto.id });

    // /* customer info */
    // const salt = await bcrypt.genSalt();
    // const payload = {
    //   id: dto.id,
    //   username: dto.username.toLowerCase(),
    //   salt,
    //   password: await this.hashPassword(dto.password, salt)
    // }
    // await this.save(payload);

    // /* customer access */
    // let customerAccessPayload: IAccessesDto[] = [];
    // dto?.customer_access?.forEach(async access => {
    //   customerAccessPayload.push({ customer: { id: customer.id }, access })
    // });
    // const customerAccessRepo = getCustomRepository(AccessesRepository);
    // await customerAccessRepo.save(customerAccessPayload);

    // /* customer roles */
    // let customerRolePayload: IRolesDto[] = [];
    // dto?.customer_role?.forEach(async customer_role => {
    //   customerRolePayload.push({ customer: { id: customer.id }, role: customer_role, })
    // });
    // const customerRoleRepo = getCustomRepository(RolesRepository);
    // await customerRoleRepo.save(customerRolePayload);

    // /* update auto created customer profile */
    // const customerProfileRepo = getCustomRepository(ProfileRepository);
    // const profile = await customerProfileRepo.findOne({ customer: customer });
    // await customerProfileRepo.save({
    //   ...profile,
    //   ...dto.customer_profile
    // });
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


