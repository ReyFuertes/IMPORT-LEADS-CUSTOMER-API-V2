import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AccessRepository } from './access.repository';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccessRepository])],
  controllers: [AccessController],
  providers: [AccessService]
})
export class AccessModule { }
