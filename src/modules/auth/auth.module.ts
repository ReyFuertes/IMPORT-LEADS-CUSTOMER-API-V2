import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStategy } from './jwt.strategy';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'topsecretbenbooterkooper',
      signOptions: { expiresIn: 7200 }
    }),
    TypeOrmModule.forFeature([AuthRepository])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStategy],
  exports: [JwtStategy, PassportModule]
})
export class AuthModule { }
