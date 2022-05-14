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
import { validateEmail } from 'src/util/validate';
import * as sgMail from '@sendgrid/mail';
import { sendGridConfig } from '../config/sendgrid.config';
import { emailConfirmationSender, emailConfirmationSubject, emailConfirmationTemplate } from '../templates/email-invite';
import { CustomerSubscriptionRepository } from '../customer-subscription/customer-subscription.repository';
import { ICustomerSubscriptionDto } from '../customer-subscription/customer-subscription.dto';
import { Subscription } from '../subscription/subscription.entity';
import { crypt, decrypt } from 'src/util/crypt';
import { encryptKey } from 'src/helpers/constant';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {

  public async isApiUrlExist(dto: any): Promise<boolean> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const profile_query = profile_repo.createQueryBuilder('profile');
    let result_count = await profile_query
      .select(['api_url'])
      .leftJoinAndSelect('profile.customer', 'customer')
      .where('api_url = :api_url', {
        api_url: dto?.api_url?.trim()
      })
      .andWhere('customer_id != :customer_id', { customer_id: dto?.id?.trim() })
      .getCount();

    if (result_count > 0) {
      return true;
    }
    return false;
  }

  public async isWebsiteUrlExist(dto: any): Promise<boolean> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const profile_query = profile_repo.createQueryBuilder('profile');
    let result_count = await profile_query
      .select(['website_url'])
      .leftJoinAndSelect('profile.customer', 'customer')
      .where('website_url = :website_url', {
        website_url: dto?.website_url?.trim()
      })
      .andWhere('customer_id != :customer_id', { customer_id: dto?.id?.trim() })
      .getCount();

    if (result_count > 0) {
      return true;
    }
    return false;
  }

  public async resetStatus(dto: CustomerUpdateStatus): Promise<ICustomerDto> {
    const exist = await this.findOne({ username: dto?.customer?.username });

    if (exist) {
      const updatedCustomer = await this.save({ ...exist, status: CustomerStatusType.Pending });
      return {
        id: updatedCustomer?.id,
        status: Number(updatedCustomer?.status),
        username: updatedCustomer?.username
      };
    } else {
      throw new BadRequestException(`Reset status failed ${exist?.username}`);
    }
  }

  public async onboardCustomer(dto: any): Promise<ICustomerResponseDto> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const role_repo = getCustomRepository(RoleRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const access_repo = getCustomRepository(AccessRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    const isInvited = await this.isInvited(dto?.email_password?.id);
    if (!isInvited) {
      throw new BadRequestException('This user is not invited');
    };

    let new_customer: ICustomerDto;
    let sleepDelay: number = 0;
    try {
      const { username, password } = dto?.email_password;
      const customer = new Customer();
      customer.username = String(username).toLowerCase();

      try {
        if (password) {
          customer.salt = await bcrypt.genSalt();
          customer.password = await this.hashPassword(password, customer.salt);
          customer.text_password = password;
        }
        const existingCustomer = await this.findOne({ username });
        if (existingCustomer) {
          customer.id = existingCustomer?.id;
          customer.status = CustomerStatusType.Pending;
        }
        customer.is_submitted = 1;
        new_customer = await this.save(customer);
      } catch (error) {
        throw new BadRequestException(`Customer failed: ${error}`);
      }

      const admin_role = await role_repo.findOne({ where: { role_name: 'admin' } });
      if (admin_role) {
        await roles_repo.save({ customer, role: admin_role });
      } else {
        throw new BadRequestException(`Customer role failed: Admin role not set.`);
      }

      try {
        const access_query = access_repo.createQueryBuilder('access');
        let customer_access_id_results: any[] = await access_query.select(['id']).getRawMany();
        const accesses_payload = customer_access_id_results?.map(access => {
          return { access, customer: { id: new_customer?.id } }
        });
        await accesses_repo.save(accesses_payload);
      } catch (error) {
        throw new BadRequestException(`Customer access failed: ${error}`);
      }

      try {
        const profile_exist = await profile_repo.findOne({ email: new_customer?.username });
        let profile_payload = {
          firstname: dto?.profile?.firstname,
          lastname: dto?.profile?.lastname,
          phone: dto?.profile?.phone,
          email: new_customer?.username,
          address: dto?.profile?.address,
          language: dto?.profile?.language,
          company_name: dto?.profile?.company_name,
          company_address: dto?.profile?.company_address,
        }
        if (profile_exist) {
          Object.assign(profile_payload, { id: profile_exist?.id });
        } else {
          Object.assign(profile_payload, { customer: { id: new_customer?.id } });
        }

        await profile_repo.save(profile_payload);
      } catch (error) {
        throw new BadRequestException(`Customer profile failed: ${error}`);
      }

      await Promise.all([dto?.users?.forEach(async (_customer_user: any) => {
        sleepDelay = sleepDelay + 1;

        const customer_user = new CustomerUser();
        customer_user.username = String(_customer_user?.username).toLowerCase();
        customer_user.salt = await bcrypt.genSalt();
        customer_user.password = await this.hashPassword(_customer_user?.password, customer_user.salt);
        customer_user.text_password = _customer_user?.password;

        let new_customer_user: ICustomerUserDto;
        try {
          new_customer_user = await customer_user_repo.save({
            ...customer_user,
            customer: new_customer
          });
        } catch (error) {
          throw new BadRequestException(`Customer profile failed: ${error}`);
        }

        try {
          const profile_exist: IProfileDto = await profile_repo.findOne({
            where: {
              email: _customer_user?.profile?.username,
              customer_user: { id: new_customer_user?.id }
            },
            relations: ['customer_user']
          }) || {};
          const profile_payload = Object.assign(profile_exist, {
            firstname: _customer_user?.profile?.firstname,
            lastname: _customer_user?.profile?.lastname,
            email: _customer_user?.username,
            language: dto?.profile?.language,
            customer_user: new_customer_user,
          });
          await profile_repo.save(profile_payload);
        } catch (error) {
          throw new BadRequestException(`Customer user profile failed: ${error}`);
        }

        try {
          const access = _customer_user?.access?.map(access_id => {
            return { customer_user: new_customer_user, access: { id: access_id } }
          });
          if (access?.length > 0) {
            await accesses_repo.save(access);
          }
        } catch (error) {
          throw new BadRequestException(`Customer user access failed: ${error}`);
        }

        try {
          const roles = _customer_user?.roles?.map(role_id => {
            return { customer_user: new_customer_user, role: { id: role_id } }
          });
          if (roles?.length > 0) {
            await roles_repo.save(roles);
          }
        } catch (error) {
          throw new BadRequestException(`Customer user roles failed: ${error}`);
        }
      })]);

      const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
      sleepDelay = sleepDelay * 1000;
      await sleep(sleepDelay);

      return await this.getCustomerById(new_customer?.id);

    } catch (error) {
      throw new BadRequestException(`Onboard customer failed: ${error}`);
    }
  }

  public async isInvited(id: string, isCustomer: boolean = true): Promise<ICustomerResponseDto> {
    let exist: ICustomerDto | ICustomerUserDto;
    let is_user_role: boolean = false;

    exist = await this.findOne({ where: { id } });
    if (!exist) {
      const customer_user_repo = getCustomRepository(CustomerUserRepository);
      exist = await customer_user_repo.findOne({ where: { id } });
      isCustomer = false;
      is_user_role = true;
    } else {
      isCustomer = true;
      is_user_role = false;
    }

    if (exist) {
      const customer_subscription_repo = getCustomRepository(CustomerSubscriptionRepository);
      const customer_subscription = await customer_subscription_repo.findOne({
        where: {
          customer: { id: exist?.id }
        },
        relations: ['customer', 'subscription']
      });

      const profile_repo = getCustomRepository(ProfileRepository);
      const profile_query = profile_repo.createQueryBuilder('profile');
      profile_query.select(['id', 'firstname', 'lastname', 'language', 'phone', 'company_name', 'company_address', 'address', 'api_url', 'website_url', 'database_name']);

      if (isCustomer) {
        profile_query.where("customer_id = :customer_id", { customer_id: id })
      } else {
        profile_query.where("customer_user_id = :customer_user_id", { customer_user_id: id })
      }

      const profile_result: IProfileDto = await profile_query.getRawOne();

      const customer_user_repo = getCustomRepository(CustomerUserRepository);
      const customer_users_result = await customer_user_repo.find({
        select: ['id', 'username', 'created_at'],
        where: { customer: { id } }
      });

      const roles_repo = getCustomRepository(RolesRepository);
      const access_repo = getCustomRepository(AccessesRepository);
      const customer_users = await Promise.all(customer_users_result?.map(async (customer_user) => {
        const roles_result = await roles_repo.find({
          where: { customer_user: { id: customer_user?.id } },
          relations: ['role']
        });
        const access_result = await access_repo.find({
          where: { customer_user: { id: customer_user?.id } },
          relations: ['access']
        });
        return {
          ...customer_user,
          roles: roles_result?.map(row => row?.role?.id),
          access: access_result?.map(row => row?.access?.id)
        }
      }));

      let response = {
        id: exist?.id,
        username: exist?.username,
        is_submitted: exist?.is_submitted,
        subscription: customer_subscription?.subscription?.id,
        profile: profile_result
      }
      if (customer_users?.length > 0) {
        Object.assign(response, { customer_users });
      }
      if (!customer_subscription && is_user_role && customer_users?.length === 0) {
        Object.assign(response, { is_user: true });
      }
      return response;
    }
    throw new BadRequestException(`Customer is not invited.`);
  }

  public async onInvite(dto: ICustomerDto[]): Promise<ICustomerDto[]> {
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

  public async updateStatus(dto: CustomerUpdateStatus): Promise<ICustomerDto> {
    const customer_exist = await this.findOne({ id: dto?.customer?.id });

    if (customer_exist && customer_exist?.status === CustomerStatusType.Ready) {
      const updatedCustomer = await this.save({ ...customer_exist, status: CustomerStatusType.Approved });

      return {
        id: updatedCustomer?.id,
        status: updatedCustomer?.status,
        username: updatedCustomer?.username
      };
    } else {
      throw new BadRequestException(`Update status failed ${customer_exist}`);
    }
  }

  public async deleteById(id: string): Promise<ICustomerDto> {
    const exist = await this.findOne({ id });
    if (exist) {
      this.createQueryBuilder()
        .delete()
        .from(Customer)
        .where("id = :id", { id })
        .execute();
      delete exist?.password;
      delete exist?.salt;
      delete exist?.text_password;

      return exist;
    }
    return null;
  }

  public async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  public async createCustomer(dto: ICustomerPayload): Promise<ICustomerResponseDto> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const role_repo = getCustomRepository(RoleRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const access_repo = getCustomRepository(AccessRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);

    let new_customer: ICustomerDto;
    let sleepDelay: number = 0;
    const { address, company_address, company_name, firstname, lastname, phone, language, api_url, website_url, database_name } = dto?.profile;

    try {
      const { id, username, password } = dto?.email_password;
      const customer = new Customer();
      if (id) {
        customer.id = id;
      } else {
        delete customer.id;
      }

      customer.username = String(username).toLowerCase();
      if (password) {
        const salt = await bcrypt.genSalt();
        const encrypted_password = crypt(encryptKey(), password);
        const hash_password = await this.hashPassword(encrypted_password, customer.salt);
        customer.salt = salt;
        customer.password = hash_password;
        customer.text_password = encrypted_password;
      }

      if (api_url && website_url) {
        customer.status = CustomerStatusType.Ready;
      } else {
        customer.status = CustomerStatusType.Pending;
      }

      customer.is_submitted = 0;
      try {
        new_customer = await this.save(customer);
      } catch (error) {
        throw new BadRequestException(`Customer failed: ${error}`);
      }

      try {
        const customer_subscription_repo = getCustomRepository(CustomerSubscriptionRepository);
        await customer_subscription_repo.save({
          customer: new_customer,
          subscription: { id: dto?.subscription }
        });
      } catch (error) {
        throw new BadRequestException(`Customer subscription failed: ${error}`);
      }

      try {
        const admin_role = await role_repo.findOne({ where: { role_name: 'admin' } });
        if (admin_role) {
          await roles_repo.save({ customer, role: admin_role });
        } else {
          throw new BadRequestException(`Customer role failed: Admin role not set.`);
        }
      } catch (error) {
        throw new BadRequestException(`Customer role failed: ${error}`);
      }

      try {
        const access_query = access_repo.createQueryBuilder('access');
        let customer_access_id_results: any[] = await access_query.select(['id']).getRawMany();
        const accesses_payload = customer_access_id_results?.map(access => {
          return { access, customer: { id: new_customer?.id } }
        });
        await accesses_repo.save(accesses_payload);
      } catch (error) {
        throw new BadRequestException(`Customer access failed: ${error}`);
      }

      try {
        await profile_repo.save({
          address,
          company_address,
          company_name,
          firstname,
          lastname,
          phone,
          email: new_customer?.username,
          customer: new_customer,
          language,
          api_url,
          website_url,
          database_name
        });
      } catch (error) {
        throw new BadRequestException(`Customer profile failed: ${error}`);
      }

      try {
        await this.sendEmail(new_customer);
      } catch (error) {
        throw new BadRequestException(`Customer email failed: ${error}`);
      }

      await Promise.all([dto?.users?.forEach(async (_customer_user: ICustomerUserDto) => {
        sleepDelay = sleepDelay + 1;
        const customer_user = new CustomerUser();
        customer_user.username = String(_customer_user?.username).toLowerCase();
        customer_user.salt = await bcrypt.genSalt();
        customer_user.password = await this.hashPassword(_customer_user.password, customer_user.salt);

        const new_customer_user = await customer_user_repo.save({
          ...customer_user,
          customer: { id: new_customer?.id }
        });

        try {
          const profile_exist = await profile_repo.findOne({
            where: {
              email: _customer_user?.username,
              customer_user: { id: new_customer_user?.id }
            },
            relations: ['customer_user']
          });
          if (!profile_exist) {
            await profile_repo.save({
              firstname: _customer_user?.profile?.firstname,
              lastname: _customer_user?.profile?.lastname,
              email: _customer_user?.username,
              language,
              website_url: website_url,
              api_url: api_url,
              company_name: company_name,
              company_address: company_address,
              database_name: database_name,
              customer_user: new_customer_user,
            });
          } else {
            throw new BadRequestException(`Customer user profile already exist`);
          }
        } catch (error) {
          throw new BadRequestException(`Customer user profile failed: ${error}`);
        }

        try {
          await Promise.all([_customer_user?.accesses.forEach(async (id) => {
            let access_exist = await accesses_repo.findOne({
              where: {
                customer_user: { id: new_customer_user?.id },
                access: { id }
              },
              relations: ['access']
            }) || {};
            Object.assign(access_exist, {
              access: { id },
              customer_user: { id: new_customer_user?.id }
            });
            await accesses_repo.save(access_exist);
          })]);
        } catch (error) {
          throw new BadRequestException(`Customer user access failed: ${error}`);
        }

        try {
          await Promise.all([_customer_user?.roles.forEach(async (id) => {
            const role_exist = await roles_repo.findOne({
              where: {
                customer_user: { id: new_customer_user?.id },
                role: { id }
              },
              relations: ['role']
            }) || {};
            Object.assign(role_exist, {
              role: { id },
              customer_user: { id: new_customer_user?.id }
            });
            await roles_repo.save(role_exist);
          })]);
        } catch (error) {
          throw new BadRequestException(`Customer user roles failed: ${error}`);
        }

        await this.sendEmail(new_customer_user);
      })]);

      const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
      sleepDelay = sleepDelay * 1000;
      await sleep(sleepDelay);

      const response = await this.getCustomerById(new_customer?.id);
      return response;

    } catch (error) {
      throw new BadRequestException(`Customer create failed: ${error}`);
    }
  }

  public async getCustomerById(id: string, showTextPassword: boolean = true): Promise<ICustomerResponseDto> {
    const query = this.createQueryBuilder('customer');
    try {
      let result: ICustomerDto = await query
        .select(['id', 'username', 'status', 'created_at', 'text_password', 'is_submitted'])
        .where("id = :id", { id: id })
        .orderBy('customer.created_at', 'DESC')
        .getRawOne();

      const profile_repo = getCustomRepository(ProfileRepository);
      const profile_query = profile_repo.createQueryBuilder('profile');
      const profile: IProfileDto = await profile_query
        .select(['id', 'firstname', 'lastname', 'language', 'phone', 'company_name', 'company_address', 'address', 'api_url', 'website_url', 'database_name'])
        .where("customer_id = :customer_id", { customer_id: result?.id })
        .getRawOne();

      const customer_user_repo = getCustomRepository(CustomerUserRepository);
      const customer_user_query = customer_user_repo.createQueryBuilder('customer_user')
      let customer_user_result = await customer_user_query
        .select(['id', 'username', 'created_at', 'customer_id'])
        .where('customer_id = :customer_id', { customer_id: result?.id })
        .getRawMany();

      const customer_subscription_repo = getCustomRepository(CustomerSubscriptionRepository);
      const customer_subscription_query = customer_subscription_repo.createQueryBuilder('customer_subscription');
      let customer_subscription_result: ICustomerSubscriptionDto = await customer_subscription_query
        .select(['customer_subscription.id', 'subscription.id', 'subscription.name', 'subscription.rate', 'subscription.description'])
        .innerJoinAndMapOne(
          "customer_subscription.subscription",
          Subscription,
          "subscription",
          "subscription.id = customer_subscription.subscription_id"
        )
        .where("customer_id = :customer_id", { customer_id: result?.id })
        .getOne();

      const roles_repo = getCustomRepository(RolesRepository);
      const accesses_repo = getCustomRepository(AccessesRepository);
      const customer_users = await Promise.all(customer_user_result.map(async (cust_user) => {
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
        });
        return { ...cust_user, accesses, roles }
      }));

      if (showTextPassword === false) {
        delete result.text_password;
      }

      let response = {
        ...result,
        profile,
        subscription: customer_subscription_result?.subscription
      }
      if (customer_users?.length > 0) {
        Object.assign(response, { customer_users })
      }
      return response;
    } catch (error) {
      throw new BadRequestException(`getCustomerById failed: ${error}`);
    }
  }

  public async getCustomers(dto?: any): Promise<any[]> {
    const query = this.createQueryBuilder('customer')
      .select(['customer.id', 'customer.username', 'customer.status', 'customer.text_password', 'customer.created_at'])
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

      const customer_subscription_repo = getCustomRepository(CustomerSubscriptionRepository);
      const customer_subscription_result = await customer_subscription_repo.findOne({
        where: { customer: { id: customer?.id } },
        relations: ['subscription']
      });

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

        return { ...customer_user, accesses, roles }
      }));

      // let decrypted_password: string = '';
      // if(customer?.text_password !== null) {
      //   decrypted_password = decrypt(encryptKey(), customer?.text_password);
      // }
      return {
        ...customer,
        text_password: customer?.text_password,
        customer_users,
        subscription: {
          id: customer_subscription_result?.subscription?.id,
          name: customer_subscription_result?.subscription?.name,
          rate: customer_subscription_result?.subscription?.rate,
          max_users: customer_subscription_result?.subscription?.max_users,
          description: customer_subscription_result?.subscription?.description
        }
      }
    }));
    return response;
  }

  public async updateCustomer(dto: ICustomerPayload): Promise<ICustomerResponseDto> {
    const profile_repo = getCustomRepository(ProfileRepository);
    const customer_user_repo = getCustomRepository(CustomerUserRepository);
    const roles_repo = getCustomRepository(RolesRepository);
    const accesses_repo = getCustomRepository(AccessesRepository);
    const role_repo = getCustomRepository(RoleRepository);
    const access_repo = getCustomRepository(AccessRepository);
    const customer_subscription_repo = getCustomRepository(CustomerSubscriptionRepository);

    let updated_customer: ICustomerDto;
    let sleepDelay: number = 0;

    try {
      const { username, password } = dto?.email_password;

      const existingCustomer = await this.findOne({ id: dto?.id });
      if (!existingCustomer) {
        throw new BadRequestException(`Customer doesnt exist.`);
      }
      const customer = new Customer();
      let customer_subscription_exist: ICustomerSubscriptionDto;

      const { address, company_address, company_name, firstname, lastname, phone, language, api_url, website_url, database_name } = dto?.profile;
      try {
        if (dto?.id) {
          customer.id = dto?.id;
        }
        customer.username = String(username).toLowerCase();
        if (password) {
          const encrypted_password = crypt(encryptKey(), password);
          const hash_password = await this.hashPassword(encrypted_password, existingCustomer.salt);
          customer.password = hash_password;
          customer.text_password = encrypted_password;
        }
     
        if (existingCustomer?.status !== CustomerStatusType.Approved && api_url && website_url) {
          customer.status = CustomerStatusType.Ready;
        } else {
          customer.status = existingCustomer.status;
        }
        customer.is_submitted = 1;
        if (customer) {
          updated_customer = await this.save(customer);
        }

        customer_subscription_exist = await customer_subscription_repo.findOne({
          where: { customer: { id: updated_customer?.id } }
        });
      } catch (error) {
        throw new BadRequestException(`Customer update failed: ${error}`);
      }

      try {
        if (customer_subscription_exist && dto?.subscription) {
          const customer_subscription_payload = Object.assign(customer_subscription_exist, {
            customer: { id: dto?.id },
            subscription: { id: dto?.subscription }
          });
          if (customer_subscription_payload) {
            await customer_subscription_repo.save(customer_subscription_payload);
          }
        }
      } catch (error) {
        throw new BadRequestException(`Customer subscription failed: ${error}`);
      }

      try {
        const admin_role = await role_repo.findOne({ where: { role_name: 'admin' } });
        if (admin_role) {
          await roles_repo.save({ customer, role: admin_role });
        } else {
          throw new BadRequestException(`Customer failed: Admin role not set.`);
        }
      } catch (error) {
        throw new BadRequestException(`Customer role update failed: ${error}`);
      }

      try {
        const access_query = access_repo.createQueryBuilder('access');
        let customer_access_id_results: any[] = await access_query.select(['id']).getRawMany();
        const accesses_payload = customer_access_id_results?.map(access => {
          return { access, customer: { id: updated_customer?.id } }
        });
        await accesses_repo.save(accesses_payload);
      } catch (error) {
        throw new BadRequestException(`Customer access update failed: ${error}`);
      }

      try {
        let customer_profile = await profile_repo.findOne({
          where: {
            customer: {
              username: existingCustomer?.username
            }
          },
          relations: ['customer']
        }) || {};
        Object.assign(customer_profile, {
          address,
          company_address,
          company_name,
          firstname,
          lastname,
          phone,
          email: updated_customer?.username,
          customer: updated_customer,
          language,
          api_url,
          website_url,
          database_name,
        });

        await profile_repo.save(customer_profile);
      } catch (error) {
        throw new BadRequestException(`Customer profile failed: ${error}`);
      }

      try {
        await Promise.all([dto?.users?.forEach(async (_customer_user: ICustomerUserDto) => {
          sleepDelay = sleepDelay + 1;
          if (!_customer_user?.id) {
            delete _customer_user.id;
          }

          let updated_customer_user: ICustomerUserDto;
          try {
            let customer_user = await customer_user_repo.findOne({
              where: { id: _customer_user?.id }
            }) || {};
            Object.assign(customer_user, {
              ..._customer_user,
              username: String(_customer_user?.username).toLowerCase(),
              customer: { id: updated_customer?.id }
            });
            updated_customer_user = await customer_user_repo.save(customer_user);
          } catch (error) {
            throw new BadRequestException(`Customer user failed: ${error}`);
          }

          try {
            let profile: IProfileDto = await profile_repo.findOne({
              where: {
                email: _customer_user?.username,
                customer_user: { id: updated_customer_user?.id }
              },
              relations: ['customer_user']
            }) || {};
            Object.assign(profile, {
              email: _customer_user?.username,
              website_url,
              api_url,
              company_name,
              company_address,
              language,
              database_name
            });
            await profile_repo.save(profile);
          } catch (error) {
            throw new BadRequestException(`Customer user profile failed: ${error}`);
          }

          try {
            await Promise.all([_customer_user?.accesses.forEach(async (id) => {
              let access_exist = await accesses_repo.findOne({
                where: {
                  customer_user: { id: updated_customer?.id },
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
            await Promise.all([_customer_user?.roles.forEach(async (id) => {
              const role_exist = await roles_repo.findOne({
                where: {
                  customer_user: { id: updated_customer?.id },
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

        })]);
      } catch (error) {
        throw new BadRequestException(`Customer user update failed: Inner ${error}`);
      }

    } catch (error) {
      throw new BadRequestException(`Customer update failed: Outer ${error}`);
    }

    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    sleepDelay = sleepDelay * 1000;
    await sleep(sleepDelay);

    return await this.getCustomerById(updated_customer?.id);
  }

  public async getRolessByCustomerId(customer_id: string): Promise<any[]> {
    const repo = getCustomRepository(RolesRepository);
    const query = repo.createQueryBuilder('customer_role');
    const results: any[] = await query
      .innerJoinAndSelect('customer_role.role', 'role.customer_role')
      .where("customer_id = :customer_id", { customer_id })
      .getMany();

    return results;
  }

  public async sendEmail(user: any): Promise<boolean> {
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


