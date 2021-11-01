import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { IAccessDto } from './access.dto';
import { Access } from './access.entity';

@EntityRepository(Access)
export class AccessRepository extends Repository<Access> {

  async getAllAccess(dto: any): Promise<IAccessDto[]> {
    const query = this.createQueryBuilder('access');

    const results = await query
      .leftJoinAndSelect('access.parent', 'parent_id')
      .orderBy('access.position', 'ASC')
      .getMany();
   
    return results;
  }
}

