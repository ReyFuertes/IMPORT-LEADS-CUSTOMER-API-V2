import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { Migrate } from './migrate.entity';
import { ICustomerDto } from '../customer/customer.dto';

@EntityRepository(Migrate)
export class MigrateRepository extends Repository<Migrate> {

  async migrate(dto: ICustomerDto): Promise<ICustomerDto> {
    console.log(dto)
    return
  }
}


