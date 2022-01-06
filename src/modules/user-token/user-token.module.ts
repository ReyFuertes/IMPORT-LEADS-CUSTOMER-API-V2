import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserTokenRepository } from './user-token.repository';
@Module({
  imports: [TypeOrmModule.forFeature([UserTokenRepository])],
  controllers: [],
  providers: []
})
export class UserTokenModule {}