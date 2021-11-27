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

  async updateUser(dto: IUserDto): Promise<IUserDto> {
    return this.repo.updateUser(dto);
  }

  async getById(id: string): Promise<IUserDto> {
    return this.repo.getById(id);
  }

  async getUsers(dto: any): Promise<IUserDto[]> {
    return this.repo.getUsers(dto);
  }

  async deleteById(id: string): Promise<IUserDto> {
    return this.repo.deleteUser(id);
  }

  async createUser(dto: IUserDto, curr_user?: IUserDto): Promise<IUserDto> {
    return this.repo.createUser(dto, curr_user);
  }
}
