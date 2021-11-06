
import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Patch, Query, Res, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
import { IProfileDto } from './profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private srv: ProfileService) { }

  @Get('/:id')
  getByCustomerId(@Param('id') id: string): Promise<Profile> {
    return this.srv.getByCustomerId(id);
  }

  @Patch()
  updateProfile(@Body() dto: IProfileDto): Promise<IProfileDto> {
    return this.srv.updateProfile(dto);
  }
}
