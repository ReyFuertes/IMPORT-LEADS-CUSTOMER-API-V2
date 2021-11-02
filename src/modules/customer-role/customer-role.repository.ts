import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { CustomerRole } from './customer-role.entity';
import { ICustomerRoleDto } from './customer-role.dto';

@EntityRepository(CustomerRole)
export class CustomerRoleRepository extends Repository<CustomerRole> {
  async getById(id: string): Promise<number[]> {
    const query = this.createQueryBuilder('customer_role');
    let results = await query
      .leftJoinAndSelect("customer_role.customer", "customer.customer_role")
      .leftJoinAndSelect("customer_role.role", "role.customer_role")
      .where("customer_id = :customer_id", { customer_id: id })
      .getMany();

    results.forEach((result: any) => {
      delete result.customer.password;
      delete result.customer.salt;
      delete result.customer.username
    });
    const ret = results.map(r => r.role.level);
    return ret;
  }

  async saveCustomerRole(dto: any): Promise<ICustomerRoleDto> {
    let ret: ICustomerRoleDto;
  
    const criteria = { role: { id: dto.role.id }, customer: { id: dto.customer.id } }

    const match = await this.findOne(criteria);
    if (match) {
      await this.delete(criteria);
    } else {
      ret = await this.save(criteria);
    }

    return ret;
  }
}

