import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { CustomerUser } from './customer-user.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AccessesRepository } from '../accesses/accesses.repository';
import { RolesRepository } from '../roles/roles.repository';
import { Customer } from '../customer/customer.entity';
import { Profile } from '../profile/profile.entity';
import { ProfileRepository } from '../profile/profile.repository';
import { Response } from 'express';

@EntityRepository(CustomerUser)
export class CustomerUserRepository extends Repository<CustomerUser> {

  // async createCustomerUser(dto: any): Promise<any> {
  //   console.log(dto)
  //   const customer_profile_repo = getCustomRepository(ProfileRepository);
  //   const customer_access_repo = getCustomRepository(AccessesRepository);
  //   const customer_roles_repo = getCustomRepository(RolesRepository);
  //   let new_customer_result: Customer;

  //   try {
  //     const { username, password } = dto?.email_password;
  //     if (username && password) {
  //       const customer = new Customer();
  //       customer.username = String(username).toLowerCase();
  //       customer.salt = await bcrypt.genSalt();
  //       customer.password = await this.hashPassword(password, customer.salt);

  //       new_customer_result = await this.save(customer);
  //     } else {
  //       throw new BadRequestException('New customer failed');
  //     }

  //     if (dto?.customer_information) {
  //       const { firstname, lastname, phone_number, address, company_name, company_address, language } = dto?.customer_information;
  //       await customer_profile_repo.save({
  //         firstname,
  //         lastname,
  //         phone: phone_number,
  //         address,
  //         company_name: company_name,
  //         company_address: company_address,
  //         language,
  //         customer: new_customer_result
  //       });
  //     } else {
  //       throw new BadRequestException('Customer profile failed');
  //     }

  //     //await Promise.all([dto?.forEach(async (customer_user_info) => {
  //     // const customerUser = new CustomerUser();
  //     // customerUser.username = String(customer_user_info?.username).toLowerCase();
  //     // customerUser.salt = await bcrypt.genSalt();
  //     // customerUser.password = await this.hashPassword(customer_user_info?.password, customerUser.salt);
  //     // const new_customer_user = await this.save(customerUser);

  //     // await user_profile_repo.save({
  //     //   firstname: user_info?.firstname,
  //     //   lastname: user_info?.lastname
  //     // });

  //     // await Promise.all([customer_user_info?.access?.forEach(async (_access) => {
  //     //   await customer_access_repo.save({
  //     //     user: new_customer_user,
  //     //     access: _access
  //     //   });
  //     // })]);

  //     // await Promise.all([customer_user_info?.roles?.forEach(async (_roles) => {
  //     //   await customer_roles_repo.save({
  //     //     user: new_customer_user,
  //     //     access: _roles
  //     //   });
  //     // })]);
  //     //})]);
  //   } catch (error) {
  //     throw new BadRequestException(`Onboarding failed, ${error}`);
  //   }
  //   return new_customer_result;
  // }

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}


