import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { AuthCredentialDto } from './auth.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomerProfileRepository } from '../customer-profile/customer-profile.repository';
import { Customer } from '../customer/customer.entity';
import { ICustomerDto } from 'src/modules/customer/customer.dto';
import { CustomerAccessRepository } from 'src/modules/customer-access/customer-access.repository';
import { CustomerRoleRepository } from 'src/modules/customer-role/customer-role.repository';
import { CustomerRoleType } from 'src/models/generic.model';
import { IRoleDto } from 'src/modules/role/role.dto';
import { ICustomerRoleDto } from 'src/modules/customer-role/customer-role.dto';
import { ICustomerAccessDto } from 'src/modules/customer-access/customer-access.dto';
import { IAccessDto } from '../access/access.dto';

@EntityRepository(Customer)
export class AuthRepository extends Repository<Customer> {
  async signUp(dto: any, curr_customer: any): Promise<any[]> {
    const { customername, password, customer_access, customer_role, customer_profile } = dto;

    const customer = new Customer();
    customer.customername = String(customername).toLowerCase();
    customer.salt = await bcrypt.genSalt();
    customer.password = await this.hashPassword(password, customer.salt);

    try {
      /* save customer */
      const customer_results = await customer.save();
      /* customer access */
      let customerAccessPayload = customer_access?.map(access => {
        return { customer: { id: customer?.id }, access }
      });
      const customer_access_repo = getCustomRepository(CustomerAccessRepository);
      const customer_access_results = await customer_access_repo.save(customerAccessPayload);

      /* customer roles */
      let customer_role_payload = customer_role?.map(role => {
        return { customer: { id: customer.id }, role }
      });

      const customer_role_repo = getCustomRepository(CustomerRoleRepository);
      const customer_roles_results = await customer_role_repo.save(customer_role_payload);

      /* customer profile */
      const customer_profile_repo = getCustomRepository(CustomerProfileRepository);
      const customer_profile_results = await customer_profile_repo.save({
        ...customer_profile,
        customer: customer_results
      });

      await Promise.all([customer_access_results, customer_roles_results, customer_profile_results]);

      return await this.getAllCustomers(curr_customer);

    } catch (error) {
      throw new BadRequestException('Signup unsuccesful');
    }
  }

  async getAllCustomers(curr_customer?: any): Promise<ICustomerDto[]> {
    /* check if the current customer is an admin */
    const customer_role_repo = getCustomRepository(CustomerRoleRepository);
    const customer_role_results: any = await customer_role_repo.findOne({
      where: { customer: { id: curr_customer?.id } }
    });
    const isAdmin = [CustomerRoleType.admin, CustomerRoleType.sp].includes(customer_role_results?.role?.role_name);
    if (!isAdmin) {
      throw new BadRequestException('Not Authorized');
    }

    const customerRoles: ICustomerRoleDto[] = await this.getCustomerRoles();
    const customerAccess: ICustomerAccessDto[] = await this.getCustomerAccess();
    
    const query = this.createQueryBuilder('customer');

    let customers: ICustomerDto[] = await query
      .innerJoinAndSelect('customer.customer_profile', 'customer_profile.customer')
      .leftJoinAndSelect('customer.customer_access', 'customer_access.customer')
      .leftJoinAndSelect('customer.customer_role', 'customer_role.customer')
      .orderBy('customer.created_at', 'DESC')
      .getMany();

    customers?.forEach((customer: ICustomerDto) => {
      delete customer.password;
      delete customer.salt;

      customer.customer_role = customerRoles?.filter(r => customer?.customer_role?.filter(ur => ur.id == r.id).shift());
      customer.customer_access = customerAccess?.filter(r => customer?.customer_access?.filter(ua => ua.id == r.id).shift());
    });
    
    /* make sure the customer has an access and not super admin */
    const response = customers?.map(u => {
      const is_super_admin = u?.customer_role?.find((r: any) => r.role?.role_name === 'sp');
      if (!is_super_admin) {
        return u;
      }
    }).filter(i => Boolean(i));

    return response;
  }

  async getCustomerRoles(): Promise<IRoleDto[]> {
    const repo = getCustomRepository(CustomerRoleRepository);
    const query = repo.createQueryBuilder('customer_role');
    const results: ICustomerRoleDto[] = await query
      .leftJoinAndSelect('customer_role.role', 'role.customer_role')
      .getMany();

    return results;
  }

  async getCustomerAccess(): Promise<IAccessDto[]> {
    const repo = getCustomRepository(CustomerAccessRepository);
    const query = repo.createQueryBuilder('customer_access');
    const results: ICustomerAccessDto[] = await query
      .leftJoinAndSelect('customer_access.access', 'access.customer_access')
      .getMany();

    return results;
  }

  async validatePassword(authCredsDto: AuthCredentialDto): Promise<Customer> {
    const { customername, password } = authCredsDto;
    const customer = await this.findOne({ customername: String(customername).toLowerCase() },
      { relations: ['customer_profile'] });

    if (customer && await customer.validatePassword(password)) {
      return customer;
    } else {
      return null;
    }
  }

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}


