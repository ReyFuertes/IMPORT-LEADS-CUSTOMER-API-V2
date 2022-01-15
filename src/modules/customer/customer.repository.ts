import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { AccessesRepository } from '../accesses/accesses.repository';
import { RolesRepository } from '../roles/roles.repository';
import { ProfileRepository } from '../profile/profile.repository';
import * as bcrypt from 'bcrypt';
import { Customer } from './customer.entity';
import { CustomerCreateStatusType, CustomerStatusType, CustomerUpdateStatus, ICustomerDto, ICustomerPayload, ICustomerResponseDto } from './customer.dto';
import { BadRequestException } from '@nestjs/common';
import { IProfileDto } from '../profile/profile.dto';
import { CustomerUser } from '../customer-user/customer-user.entity';
import { ICustomerUserDto } from '../customer-user/customer-user.dto';
import { CustomerUserRepository } from '../customer-user/customer-user.repository';
import { sqlOp } from 'src/models/generic.model';
import { Profile } from '../profile/profile.entity';
import { RoleRepository } from '../role/role.repository';
import { AccessRepository } from '../access/access.repository';
import { v4 as uuid } from 'uuid'
import { validateEmail } from 'src/util/validate';
import * as sgMail from '@sendgrid/mail';
import { sendGridConfig } from '../config/sendgrid.config';
import { emailConfirmationSender, emailConfirmationSubject, emailConfirmationTemplate } from '../templates/email-invite';
import { CustomerSubscriptionRepository } from '../customer-subscription/customer-subscription.repository';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {

  async onboardCustomer(dto: any): Promise<ICustomerResponseDto> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const role_repo = getCustomRepository(RoleRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const access_repo = getCustomRepository(AccessRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    let new_customer: ICustomerDto;
    try {
      const { id, username, password } = dto?.email_password;
      const customer = new Customer();
      customer.id = id;
      customer.username = String(username).toLowerCase();
      customer.salt = await bcrypt.genSalt();
      customer.password = await this.hashPassword(password, customer.salt);
      customer.status = CustomerStatusType.Pending;
      customer.text_password = password;
      new_customer = await this.save(customer);

      //set admin role
      const admin_role = await role_repo.findOne({ where: { role_name: 'admin' } });
      if (admin_role) {
        await roles_repo.save({ customer, role: admin_role });
      } else {
        throw new BadRequestException(`Customer failed: Admin role not set.`);
      }
      //set access
      const access_query = access_repo.createQueryBuilder('access');
      let customer_access_id_results: any[] = await access_query.select(['id']).getRawMany();
      const accesses_payload = customer_access_id_results?.map(access => {
        return { access, customer: { id: new_customer?.id } }
      });
      await accesses_repo.save(accesses_payload);

      const { firstname, lastname, phone_number, address, company_name, company_address, language } = dto?.general_information;
      await profile_repo.save({
        address,
        firstname,
        lastname,
        phone_number,
        email: new_customer?.username,
        customer: new_customer,
        language,
        company_name,
        company_address
      });

      await Promise.all([dto?.user_information?.forEach(async (customer_user_info: any) => {
        const customer_user = new CustomerUser();
        customer_user.username = String(customer_user_info?.username).toLowerCase();
        customer_user.salt = await bcrypt.genSalt();
        customer_user.password = await this.hashPassword(customer_user_info?.password, customer_user.salt);
        customer_user.text_password = customer_user_info?.password;
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
        const access = customer_user_info?.access?.map(access_id => {
          return { customer_user: new_customer_user, access: { id: access_id } }
        });
        await accesses_repo.save(access);
        /* roles */
        const roles = customer_user_info?.roles?.map(role_id => {
          return { customer_user: new_customer_user, role: { id: role_id } }
        });
        await roles_repo.save(roles);
      })]);

    } catch (error) {
      throw new BadRequestException(`Customer failed: ${error}`);
    }
    return await this.getCustomerById(new_customer?.id);
  }

  async isInvited(id: string): Promise<ICustomerDto> {
    const exist = await this.findOne({ where: { id } });
    if (exist) {
      const customer_subscription_repo = getCustomRepository(CustomerSubscriptionRepository);
      const customer_subscription = await customer_subscription_repo.findOne({
        where: {
          customer: { id: exist?.id }
        },
        relations: ['customer', 'subscription']
      });
      return {
        id: exist?.id,
        username: exist?.username,
        subscription: customer_subscription?.subscription?.id
      }
    }
    throw new BadRequestException(`Customer is not invited.`);
  }

  async onInvite(dto: ICustomerDto[]): Promise<ICustomerDto[]> {
    let results = await Promise.all(dto?.map(async (row) => {
      const exist = await this.findOne({ username: row?.username });
      if (!exist) {
        const customer = new Customer();
        customer.username = row.username;
        customer.status = CustomerStatusType.Pending;
        const new_customer = await this.save(customer);

        const customer_subscription_repo = getCustomRepository(CustomerSubscriptionRepository);
        await customer_subscription_repo.save({
          customer: new_customer,
          subscription: { id: row?.subscription }
        });

        if (new_customer) {
          await this.sendEmail(new_customer);
          return {
            id: new_customer.id,
            username: new_customer.username,
            message: "Customer successfully added.",
            create_status: CustomerCreateStatusType.success
          };
        } else {
          return {
            username: customer.username,
            message: "Customer invite failed.",
            create_status: CustomerCreateStatusType.failed
          }
        }
      } else {
        return {
          username: exist?.username,
          message: "Customer already existed.",
          create_status: CustomerCreateStatusType.failed
        }
      }
    }));
    return results;
  }

  async updateStatus(dto: CustomerUpdateStatus): Promise<ICustomerDto> {
    const exist = await this.findOne({ username: dto?.customer?.username });

    if (exist && exist?.status === CustomerStatusType.Pending) {
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
    const role_repo = getCustomRepository(RoleRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const access_repo = getCustomRepository(AccessRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    let new_customer: ICustomerDto;
    try {
      const { id, username, password } = dto?.email_password;
      const customer = new Customer();
      if (id) customer.id = id;
      customer.username = String(username).toLowerCase();
      customer.salt = await bcrypt.genSalt();
      customer.password = await this.hashPassword(password, customer.salt);
      customer.status = CustomerStatusType.Pending;
      new_customer = await this.save(customer);

      //set admin role
      const admin_role = await role_repo.findOne({ where: { role_name: 'admin' } });
      if (admin_role) {
        await roles_repo.save({ customer, role: admin_role });
      } else {
        throw new BadRequestException(`Customer failed: Admin role not set.`);
      }
      //set access
      const access_query = access_repo.createQueryBuilder('access');
      let customer_access_id_results: any[] = await access_query.select(['id']).getRawMany();
      const accesses_payload = customer_access_id_results?.map(access => {
        return { access, customer: { id: new_customer?.id } }
      });
      await accesses_repo.save(accesses_payload);

      const { address, company_address, company_name, firstname, lastname, phone_number, language, api_url, website_url, database_name } = dto?.profile;
      await profile_repo.save({
        address,
        company_address,
        company_name,
        firstname,
        lastname,
        phone_number,
        email: new_customer?.username,
        customer: new_customer,
        language,
        api_url,
        website_url,
        database_name
      });

      await Promise.all([dto?.users?.forEach(async (customer_user_info: ICustomerUserDto) => {
        const customer_user = new CustomerUser();
        customer_user.username = String(customer_user_info?.username).toLowerCase();
        customer_user.salt = await bcrypt.genSalt();
        customer_user.password = await this.hashPassword(customer_user_info.password, customer_user.salt);
        const new_customer_user = await customer_user_repo.save({
          ...customer_user,
          customer: new_customer
        });

        await profile_repo.save({
          email: customer_user_info?.username,
          language,
          customer_user: new_customer_user,
        });

        const access = customer_user_info?.accesses?.map(access => {
          return { customer_user: new_customer_user, access }
        });
        await accesses_repo.save(access);

        const roles = customer_user_info?.roles?.map(role => {
          return { customer_user: new_customer_user, role }
        });
        await roles_repo.save(roles);

        await this.sendEmail(new_customer);
      })]);

    } catch (error) {
      throw new BadRequestException(`Customer create failed: ${error}`);
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
      .select(['id', 'firstname', 'lastname', 'language', 'phone_number', 'company_name', 'company_address', 'address', 'api_url', 'website_url', 'database_name'])
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

      const customer_users_results: ICustomerUserDto[] = await customer_user_query
        .select(['id', 'username', 'status'])
        .where("customer_id = :customer_id", { customer_id: customer?.id })
        .getRawMany();

      const customer_users = await Promise.all(customer_users_results?.map(async (customer_user) => {
        const roles_repo = getCustomRepository(RolesRepository);
        const roles = await roles_repo.find({
          where: { customer_user: { id: customer_user?.id } },
          relations: ['role']
        });

        const accesses_repo = getCustomRepository(AccessesRepository);
        const accesses = await accesses_repo.find({
          where: { customer_user: { id: customer_user?.id } },
          relations: ['access']
        });

        return {
          ...customer_user,
          accesses,
          roles
        }
      }));

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
      if (dto?.id) {
        customer.id = dto?.id;
      }
      customer.username = String(username).toLowerCase();
      if (password) {
        customer.salt = await bcrypt.genSalt();
        customer.password = await this.hashPassword(password, customer.salt);
      }
      customer_to_update = await this.save(customer);

      const { id, address, company_address, company_name, firstname, lastname, phone_number, language, api_url, website_url, database_name } = dto?.profile;
      let profile: IProfileDto = {
        address,
        company_address,
        company_name,
        firstname,
        lastname,
        phone_number,
        email: customer_to_update?.username,
        customer: customer_to_update,
        language,
        api_url,
        website_url,
        database_name,
      }
      if (id) {
        profile.id = id;
      }
      await profile_repo.save(profile);

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

  async sendEmail(user: any): Promise<boolean> {
    const { username } = user;
    if (username && validateEmail(username)) {
      sgMail.setApiKey(sendGridConfig.api_key);
      sgMail.send({
        to: username,
        from: emailConfirmationSender(),
        subject: emailConfirmationSubject(),
        html: emailConfirmationTemplate(user),
      }).then(() => {
        return true;
      }, () => {
        return false;
      });
    }
    return false;
  }

}


