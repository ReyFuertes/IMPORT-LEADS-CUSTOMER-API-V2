import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { GetRoleDto, IRoleDto } from './role.dto';
import { RoleRepository } from './role.repository';
import { Role } from './role.entity';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(@InjectRepository(RoleRepository) public repo: RoleRepository) {
    super(repo);
  }
  async createRoles(dto: any, req: any): Promise<IRoleDto[]> {
    return this.repo.createRoles(dto, req)
  }

  async getAllRole(dto: GetRoleDto): Promise<IRoleDto[]> {
    return this.repo.getAllRole(dto)
  }
}
