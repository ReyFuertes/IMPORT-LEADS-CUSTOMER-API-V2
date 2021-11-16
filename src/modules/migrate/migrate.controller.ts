import { Controller, Get, Post, Body, Param, Delete, Patch, Query, SetMetadata, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ICustomerDto } from '../customer/customer.dto';
import { MigrateService } from './migrate.service';

@Controller('migrate')
export class MigrateController {
  constructor(private srv: MigrateService) { }

  @Post()
  migrate(@Body() dto: ICustomerDto): Promise<ICustomerDto> {
    return this.srv.migrate(dto);
  }
}
