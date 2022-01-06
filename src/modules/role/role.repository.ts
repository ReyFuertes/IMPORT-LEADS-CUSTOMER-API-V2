import { sqlOp } from 'src/models/generic.model';
import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { Role } from './role.entity';
import { IRoleDto } from './role.dto';
import { UserTokenRepository } from '../user-token/user-token.repository';
import { BadRequestException } from '@nestjs/common';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {

  async createRoles(dto: any, req: any): Promise<IRoleDto[]> {
    const user_token_repo = getCustomRepository(UserTokenRepository);
    const token = await user_token_repo.findOne({ app_token: dto.create_admin_token });
    if (!token) {
      throw new BadRequestException(`Roles token failed.`);
    }

    if (dto?.roles?.length > 0) {
      return await this.save(dto?.roles);
    }
    return null;
  }

  async getAllRole(dto: any): Promise<IRoleDto[]> {
    const query = this.createQueryBuilder('role');
    let access = await query.getMany();
    access = access.filter(a => a.level !== 100);

    return access;
  }
}

