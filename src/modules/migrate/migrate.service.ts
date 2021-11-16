import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { ICustomerDto } from '../customer/customer.dto';
import { Migrate } from './migrate.entity';
import { MigrateRepository } from './migrate.repository';

@Injectable()
export class MigrateService extends BaseService<Migrate> {
  constructor(@InjectRepository(MigrateRepository) public repo: MigrateRepository) {
    super(repo);
  }
  async migrate(dto: any): Promise<ICustomerDto> {
    return this.repo.migrate(dto);
  }
}
