
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CustomerProfileRepository } from './customer-profile.repository';
import { CustomerProfileController } from './customer-profile.controller';
import { CustomerProfileService } from './customer-profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfileRepository])],
  controllers: [CustomerProfileController],
  providers: [CustomerProfileService]
})
export class CustomerProfileModule { }
