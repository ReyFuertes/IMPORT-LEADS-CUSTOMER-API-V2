import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AccessesRepository } from './accesses.repository';
import { AccessesController } from './accesses.controller';
import { AccessesService } from './accesses.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessesRepository])],
  controllers: [AccessesController],
  providers: [AccessesService]
})
export class AccessesModule { }
