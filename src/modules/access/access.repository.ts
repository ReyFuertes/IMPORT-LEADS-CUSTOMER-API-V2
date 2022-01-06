import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { IAccessDto } from './access.dto';
import { Access } from './access.entity';

@EntityRepository(Access)
export class AccessRepository extends Repository<Access> {

  async getAllAccess(dto: any): Promise<IAccessDto[]> {
    const query = this.createQueryBuilder('access');
    const results = await query
      .select(['id', 'access_name', 'access_route', 'position', 'parent_id'])
      .orderBy('access.position', 'ASC')
      .getRawMany();

    const response = await Promise.all(results.map(async (access) => {
      const parent = await this.findOne({
        where: { id: access?.parent_id }
      });
      delete access.parent_id;
      return {
        ...access,
        parent
      }
    }));
    return response;
  }
}

