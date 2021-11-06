
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { Profile } from './profile.entity';
import { ProfileRepository } from './profile.repository';
import { IProfileDto } from './profile.dto';

@Injectable()
export class ProfileService extends BaseService<Profile> {
  constructor(@InjectRepository(ProfileRepository) public repo: ProfileRepository) {
    super(repo);
  }

  async updateProfile(dto: IProfileDto): Promise<IProfileDto> {
    return this.repo.updateProfile(dto);
  }

  async getByCustomerId(id: string): Promise<Profile> {
    return this.repo.getByCustomerId(id);
  }
}
