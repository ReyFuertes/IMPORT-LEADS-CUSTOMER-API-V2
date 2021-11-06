import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AccessesService } from './accesses.service';
import { IAccessesDto } from './accesses.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('accesses')
@UseGuards(AuthGuard('jwt'))
export class AccessesController {
  constructor(private srv: AccessesService) { }

  // @Get('/:id')
  // getById(@Param('id') id: string): Promise<string[]> {
  //   return this.srv.getById(id);
  // }

  // @Post()
  // create(@Body() dto: IAccessesDto): Promise<IAccessesDto[]> {
  //   return this.srv.saveAccesses(dto);
  // }
}
