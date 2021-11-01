import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CustomerRoleRepository } from './customer-role.repository';
import { CustomerRoleController } from './customer-role.controller';
import { CustomerRoleService } from './customer-role.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerRoleRepository])],
  controllers: [CustomerRoleController],
  providers: [CustomerRoleService]
})
export class CustomerRoleModule { }
