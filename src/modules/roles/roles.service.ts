import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { Roles } from './roles.entity';
import { IRolesDto } from './roles.dto';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService extends BaseService<Roles> {
  constructor(@InjectRepository(RolesRepository) public repo: RolesRepository) {
    super(repo);
  }

  async createUserRoles(dto: any, req: any): Promise<IRolesDto[]> {
    return this.repo.createUserRoles(dto, req);
  }

  async getById(id: string): Promise<number[]> {
    return this.repo.getById(id);
  }

  async saveRoles(dto: any): Promise<IRolesDto> {
    return this.repo.saveRoles(dto);
  }
}
