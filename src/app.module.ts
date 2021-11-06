import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './modules/config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AccessModule } from './modules/access/access.module';
import { AccessesModule } from './modules/accesses/accesses.module';
import { RolesModule } from './modules/roles/roles.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from './modules/role/role.module';
import { CustomerUserModule } from './modules/customer-user/customer-user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    ProfileModule,
    CustomerModule,
    AccessModule,
    AccessesModule,
    RolesModule,
    RoleModule,
    CustomerUserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
