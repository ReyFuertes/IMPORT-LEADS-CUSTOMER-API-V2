import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { IRolesDto } from './roles.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RolesController {
  constructor(private srv: RolesService) { }

  @Post('create')
  createUserRoles(@Body() dto: any, @Req() req: any): Promise<IRolesDto[]> {
    return this.srv.createUserRoles(dto, req?.user);
  }

  @Get('/:id')
  getById(@Param('id') id: string): Promise<number[]> {
    return this.srv.getById(id);
  }

  @Post()
  create(@Body() dto: any): Promise<IRolesDto> {
    return this.srv.saveRoles(dto);
  }
}
