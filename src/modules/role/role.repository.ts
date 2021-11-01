import { sqlOp } from 'src/models/generic.model';
import { Repository, EntityRepository } from 'typeorm';
import * as _ from 'lodash';
import { Role } from './role.entity';
import { IRoleDto } from './role.dto';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {

  async getAllRole(dto: any): Promise<IRoleDto[]> {
    const query = this.createQueryBuilder('role');
    let access = await query.getMany();
    access = access.filter(a => a.level !== 100);


    return access;
  }
}

