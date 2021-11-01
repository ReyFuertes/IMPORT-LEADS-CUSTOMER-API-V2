import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { CustomerAccess } from './customer-access.entity';
import { ICustomerAccessDto } from './customer-access.dto';

@EntityRepository(CustomerAccess)
export class CustomerAccessRepository extends Repository<CustomerAccess> {

  async getById(id: string): Promise<string[]> {
    const query = this.createQueryBuilder('customer_access');
    let results = await query
      .leftJoinAndSelect("customer_access.customer", "customer.customer_access")
      .leftJoinAndSelect("customer_access.access", "access.customer_access")
      .where("customer_id = :customer_id", { customer_id: id })
      .getMany();

    results.forEach((result: any) => {
      delete result.customer.password;
      delete result.customer.salt;
      delete result.customer.customername
    });

    let fmt_results = results.map(r => {
      return {
        name: r.access.access_name,
        position: r.access.position
      }
    });

    fmt_results = _.sortBy(fmt_results, function (i) {
      return i.position;
    });

    const ret = fmt_results.map(r => r.name);

    return ret;
  }

  async saveCustomerAccess(dto: ICustomerAccessDto): Promise<ICustomerAccessDto[]> {
    let ret: ICustomerAccessDto;
    const criteria = {
      customer: { id: dto.customer.id },
      access: { id: dto.access.id }
    }

    const match = await this.findOne(criteria);

    if (match) {
      await this.delete(criteria);
    } else {
      ret = await this.save(dto);
    }

    const query = this.createQueryBuilder('customer_access');
    const results: ICustomerAccessDto[] = await query
      .leftJoinAndSelect('customer_access.access', 'access.customer_access')
      .where("customer_id = :customer_id", { customer_id: dto.customer.id })
      .getMany();

    const customerDto = results.map(r => {
      return {
        ...r,
        customer: { id: dto.customer.id }
      }
    })
    return customerDto;
  }
}