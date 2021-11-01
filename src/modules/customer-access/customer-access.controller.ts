import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CustomerAccessService } from './customer-access.service';
import { ICustomerAccessDto } from './customer-access.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('customer-access')
@UseGuards(AuthGuard('jwt'))
export class CustomerAccessController {
  constructor(private srv: CustomerAccessService) { }

  @Get('/:id')
  getById(@Param('id') id: string): Promise<string[]> {
    return this.srv.getById(id);
  }

  @Post()
  create(@Body() dto: ICustomerAccessDto): Promise<ICustomerAccessDto[]> {
    return this.srv.saveCustomerAccess(dto);
  }
}
