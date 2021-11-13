import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { UserRepository } from './user.repository';
import { GetUserDto, IUserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectRepository(UserRepository) public repo: UserRepository) {
    super(repo);
  }

  async deleteById(id: string): Promise<IUserDto> {
    return this.repo.deleteUser(id);
  }

  async createUser(dto: IUserDto, curr_user?: IUserDto): Promise<void> {
    return this.repo.createUser(dto, curr_user);
  }
}
