import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './modules/config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerProfileModule } from './modules/customer-profile/customer-profile.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AccessModule } from './modules/access/access.module';
import { CustomerAccessModule } from './modules/customer-access/customer-access.module';
import { CustomerRoleModule } from './modules/customer-role/customer-role.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from './modules/role/role.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    CustomerProfileModule,
    CustomerModule,
    AccessModule,
    CustomerAccessModule,
    CustomerRoleModule,
    RoleModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
