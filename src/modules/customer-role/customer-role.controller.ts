import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CustomerRoleService } from './customer-role.service';
import { ICustomerRoleDto } from './customer-role.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('customer-role')
@UseGuards(AuthGuard('jwt'))
export class CustomerRoleController {
  constructor(private srv: CustomerRoleService) { }

  @Get('/:id')
  getById(@Param('id') id: string): Promise<number[]> {
    return this.srv.getById(id);
  }

  @Post()
  create(@Body() dto: any): Promise<ICustomerRoleDto> {
    return this.srv.saveCustomerRole(dto);
  }
}
