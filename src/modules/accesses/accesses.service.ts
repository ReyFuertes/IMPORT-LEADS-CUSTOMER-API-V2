import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { AccessesRepository } from './accesses.repository';
import { IAccessesDto } from './accesses.dto';
import { Accesses } from './accesses.entity';

@Injectable()
export class AccessesService extends BaseService<Accesses> {
  constructor(@InjectRepository(AccessesRepository) public repo: AccessesRepository) {
    super(repo);
  }

  // async getById(id: string): Promise<string[]> {
  //   return this.repo.getById(id);
  // }

  // async saveAccesses(dto: IAccessesDto): Promise<IAccessesDto[]> {
  //   return this.repo.saveAccesses(dto);
  // }
}
