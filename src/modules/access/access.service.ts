import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../base.service';
import { GetAccesDto, IAccessDto } from './access.dto';
import { AccessRepository } from './access.repository';
import { Access } from './access.entity';

@Injectable()
export class AccessService extends BaseService<Access> {
  constructor(@InjectRepository(AccessRepository) public repo: AccessRepository) {
    super(repo);
  }

  async getAllAccess(dto: GetAccesDto): Promise<IAccessDto[]> {
    return this.repo.getAllAccess(dto)
  }
}
