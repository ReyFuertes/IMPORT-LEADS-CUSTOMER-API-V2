import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { ICustomerAccessDto } from '../customer-access/customer-access.dto';
import { CustomerAccessRepository } from '../customer-access/customer-access.repository';
import { CustomerRoleRepository } from '../customer-role/customer-role.repository';
import { IRoleDto } from '../role/role.dto';
import { ICustomerRoleDto } from '../customer-role/customer-role.dto';
import { CustomerProfileRepository } from '../customer-profile/customer-profile.repository';
import * as bcrypt from 'bcrypt';
import { Customer } from './customer.entity';
import { ICustomerDto } from './customer.dto';
import { BadRequestException } from '@nestjs/common';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async updateCustomer(dto: ICustomerDto): Promise<void> {
    const customer = await this.findOne({ id: dto.id });

    /* customer info */
    const salt = await bcrypt.genSalt();
    const payload = {
      id: dto.id,
      customername: dto.customername.toLowerCase(),
      salt,
      password: await this.hashPassword(dto.password, salt)
    }
    await this.save(payload);

    /* customer access */
    let customerAccessPayload: ICustomerAccessDto[] = [];
    dto?.customer_access?.forEach(async access => {
      customerAccessPayload.push({ customer: { id: customer.id }, access })
    });
    const customerAccessRepo = getCustomRepository(CustomerAccessRepository);
    await customerAccessRepo.save(customerAccessPayload);

    /* customer roles */
    let customerRolePayload: ICustomerRoleDto[] = [];
    dto?.customer_role?.forEach(async customer_role => {
      customerRolePayload.push({ customer: { id: customer.id }, role: customer_role, })
    });
    const customerRoleRepo = getCustomRepository(CustomerRoleRepository);
    await customerRoleRepo.save(customerRolePayload);

    /* update auto created customer profile */
    const customerProfileRepo = getCustomRepository(CustomerProfileRepository);
    const profile = await customerProfileRepo.findOne({ customer: customer });
    await customerProfileRepo.save({
      ...profile,
      ...dto.customer_profile
    });
  }

  async createCustomer(dto: any, curr_customer: any): Promise<ICustomerDto[]> {
    const customer_repo = getCustomRepository(CustomerRepository);
    const customer_profile_repo = getCustomRepository(CustomerProfileRepository);
    const customer_access_repo = getCustomRepository(CustomerAccessRepository);
    const customer_roles_repo = getCustomRepository(CustomerRoleRepository);

    let customer_result: Customer;
    try {
      const { customername, password } = dto?.email_password;
      if (customername && password) {
        const customer = new Customer();
        customer.customername = String(customername).toLowerCase();
        customer.salt = await bcrypt.genSalt();
        customer.password = await this.hashPassword(password, customer.salt);

        customer_result = await customer_repo.save(customer);
      } else {
        throw new BadRequestException('Customer failed');
      }

    } catch (error) {

    }

    return
  }

  async getAllCustomers(curr_customer?: any): Promise<ICustomerDto[]> {
    const customer_profile_repo = getCustomRepository(CustomerProfileRepository);

    const customer_role_repo = getCustomRepository(CustomerRoleRepository);
    const customer_role_results: any = await customer_role_repo.find({
      where: { customer: { id: curr_customer?.id } },
      relations: ['customer']
    });

    const query = this.createQueryBuilder('customer');
    //Note: optimize
    let customers: ICustomerDto[] = await query
      .leftJoinAndSelect('customer.customer_profile', 'customer_profile.customer')
      .orderBy('customer.created_at', 'DESC')
      .getMany();

    const _customers: any[] = await Promise.all(customers?.map(async (u: ICustomerDto) => {
      const customer_profile = await customer_profile_repo.findOne({
        where: { customer: { id: u?.id } },
        relations: ['customer']
      });
      delete customer_profile?.customer;
      const customer_info = {
        customername: u?.customername,
        ...customer_profile,
        name: `${customer_profile?.firstname} ${customer_profile?.lastname}`,
        status: u?.status
      }
      return {
        ...customer_info,
        customer_role: await this.getCustomerRolesByCustomerId(u?.id),
        customer_access: []
      }
    }));

    return _customers;
  }

  async getCustomerRolesByCustomerId(customer_id: string): Promise<IRoleDto[]> {
    const repo = getCustomRepository(CustomerRoleRepository);
    const query = repo.createQueryBuilder('customer_role');
    const results: ICustomerRoleDto[] = await query
      .innerJoinAndSelect('customer_role.role', 'role.customer_role')
      .where("customer_id = :customer_id", { customer_id })
      .getMany();

    return results;
  }
}


