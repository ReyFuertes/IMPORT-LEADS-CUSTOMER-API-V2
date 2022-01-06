import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { GetRoleDto, IRoleDto } from './role.dto';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private srv: RoleService) { }

  @Post('create')
  createRoles(@Body() dto: any, @Req() req: any): Promise<IRoleDto[]> {
    return this.srv.createRoles(dto, req?.user);
  }

  @Get()
  getAll(@Query() dto: GetRoleDto): Promise<IRoleDto[]> {
    return this.srv.getAllRole(dto);
  }
}
