import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { Accesses } from './accesses.entity';
import { IAccessesDto } from './accesses.dto';

@EntityRepository(Accesses)
export class AccessesRepository extends Repository<Accesses> {

  // async getById(id: string): Promise<string[]> {
  //   const query = this.createQueryBuilder('customer_access');
  //   let results = await query
  //     .leftJoinAndSelect("customer_access.customer", "customer.customer_access")
  //     .leftJoinAndSelect("customer_access.access", "access.customer_access")
  //     .where("customer_id = :customer_id", { customer_id: id })
  //     .getMany();

  //   results.forEach((result: any) => {
  //     delete result.customer.password;
  //     delete result.customer.salt;
  //     delete result.customer.username
  //   });

  //   let fmt_results = results.map(r => {
  //     return {
  //       name: r.access.access_name,
  //       position: r.access.position
  //     }
  //   });

  //   fmt_results = _.sortBy(fmt_results, function (i) {
  //     return i.position;
  //   });

  //   const ret = fmt_results.map(r => r.name);

  //   return ret;
  // }

  // async saveAccesses(dto: IAccessesDto): Promise<IAccessesDto[]> {
  //   let ret: IAccessesDto;
  //   const criteria = {
  //     customer: { id: dto.customer.id },
  //     access: { id: dto.access.id }
  //   }

  //   const match = await this.findOne(criteria);

  //   if (match) {
  //     await this.delete(criteria);
  //   } else {
  //     ret = await this.save(dto);
  //   }

  //   const query = this.createQueryBuilder('customer_access');
  //   const results: IAccessesDto[] = await query
  //     .leftJoinAndSelect('customer_access.access', 'access.customer_access')
  //     .where("customer_id = :customer_id", { customer_id: dto.customer.id })
  //     .getMany();

  //   const customerDto = results.map(r => {
  //     return {
  //       ...r,
  //       customer: { id: dto.customer.id }
  //     }
  //   })
  //   return customerDto;
  // }
}