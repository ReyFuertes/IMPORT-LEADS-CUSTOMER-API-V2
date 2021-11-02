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
import { CustomerStatusType, ICustomerDto } from './customer.dto';
import { BadRequestException } from '@nestjs/common';
import { CustomerRoleType } from 'src/models/generic.model';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async createCustomer(dto: any): Promise<ICustomerDto[]> {
    const customer_repo = getCustomRepository(CustomerRepository);
    const customer_profile_repo = getCustomRepository(CustomerProfileRepository);

    let new_customer: ICustomerDto;
    try {
      const { username, password } = dto?.email_password;
      if (username && password) {
        const customer = new Customer();
        customer.username = String(username).toLowerCase();
        customer.salt = await bcrypt.genSalt();
        customer.password = await this.hashPassword(password, customer.salt);
        customer.status = CustomerStatusType.Pending;

        new_customer = await customer_repo.save(customer);

      } else {
        throw new BadRequestException('Customer failed');
      }
    } catch (error) {

    }

    try {
      const { address, company_address, companyName, firstname, lastname, phone_number } = dto?.customer_information;

      if (dto?.customer_information) {
        await customer_profile_repo.save({
          address,
          company_address,
          companyName,
          firstname,
          lastname,
          phone_number,
          email: new_customer?.username,
          customer: new_customer
        });
      }
    } catch (error) {
      throw new BadRequestException('Customer profile failed');
    }
    return
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
    // let customerAccessPayload: ICustomerAccessDto[] = [];
    // dto?.customer_access?.forEach(async access => {
    //   customerAccessPayload.push({ customer: { id: customer.id }, access })
    // });
    // const customerAccessRepo = getCustomRepository(CustomerAccessRepository);
    // await customerAccessRepo.save(customerAccessPayload);

    // /* customer roles */
    // let customerRolePayload: ICustomerRoleDto[] = [];
    // dto?.customer_role?.forEach(async customer_role => {
    //   customerRolePayload.push({ customer: { id: customer.id }, role: customer_role, })
    // });
    // const customerRoleRepo = getCustomRepository(CustomerRoleRepository);
    // await customerRoleRepo.save(customerRolePayload);

    // /* update auto created customer profile */
    // const customerProfileRepo = getCustomRepository(CustomerProfileRepository);
    // const profile = await customerProfileRepo.findOne({ customer: customer });
    // await customerProfileRepo.save({
    //   ...profile,
    //   ...dto.customer_profile
    // });
  }


  async getCustomerRolesByCustomerId(customer_id: string): Promise<any[]> {
    const repo = getCustomRepository(CustomerRoleRepository);
    const query = repo.createQueryBuilder('customer_role');
    const results: any[] = await query
      .innerJoinAndSelect('customer_role.role', 'role.customer_role')
      .where("customer_id = :customer_id", { customer_id })
      .getMany();

    return results;
  }
}


