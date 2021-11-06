import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CustomerUserRepository } from './customer-user.repository';
import { CustomerUserController } from './customer-user.controller';
import { CustomerUserService } from './customer-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerUserRepository])],
  controllers: [CustomerUserController],
  providers: [CustomerUserService]
})
export class CustomerUserModule { }
