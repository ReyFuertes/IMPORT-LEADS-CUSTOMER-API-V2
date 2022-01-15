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
import { RoleModule } from './modules/role/role.module';
import { CustomerUserModule } from './modules/customer-user/customer-user.module';
import { MigrateModule } from './modules/migrate/migrate.module';
import { UsersModule } from './modules/user/user.module';
import { UserTokenModule } from './modules/user-token/user-token.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { CustomerSubscriptionModule } from './modules/customer-subscription/customer-subscription.module';

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
    CustomerUserModule,
    MigrateModule,
    UsersModule,
    UserTokenModule,
    SubscriptionModule,
    CustomerSubscriptionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
