import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CustomerAccessRepository } from './customer-access.repository';
import { CustomerAccessController } from './customer-access.controller';
import { CustomerAccessService } from './customer-access.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerAccessRepository])],
  controllers: [CustomerAccessController],
  providers: [CustomerAccessService]
})
export class CustomerAccessModule { }
