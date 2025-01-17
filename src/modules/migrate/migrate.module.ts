import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MigrateRepository } from './migrate.repository';
import { MigrateController } from './migrate.controller';
import { MigrateService } from './migrate.service';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([MigrateRepository]),
  ],
  controllers: [MigrateController],
  providers: [MigrateService]
})
export class MigrateModule { }
