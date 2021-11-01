
import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete, Patch, Query, Res, UseGuards } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CustomerProfile } from './customer-profile.entity';
import { ICustomerProfileDto } from './customer-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('customer-profile')
@UseGuards(AuthGuard('jwt'))
export class CustomerProfileController {
  constructor(private srv: CustomerProfileService) { }

  @Get('/:id')
  getByCustomerId(@Param('id') id: string): Promise<CustomerProfile> {
    return this.srv.getByCustomerId(id);
  }

  @Patch()
  updateProfile(@Body() dto: ICustomerProfileDto): Promise<ICustomerProfileDto> {
    return this.srv.updateProfile(dto);
  }
}
