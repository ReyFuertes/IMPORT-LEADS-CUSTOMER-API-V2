import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Patch, Query, Res } from '@nestjs/common';
import { GetAccesDto, IAccessDto } from './access.dto';
import { AccessService } from './access.service';

@Controller('access')
export class AccessController {
  constructor(private srv: AccessService) { }

  @Get()
  getAll(@Query() dto: GetAccesDto): Promise<IAccessDto[]> {
    return this.srv.getAllAccess(dto);
  }
}
