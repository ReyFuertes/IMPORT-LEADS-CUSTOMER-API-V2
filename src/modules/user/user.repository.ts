import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { IUserDto, UserStatusType } from './user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, BadRequestException, HttpStatus } from '@nestjs/common';
import { IAccessDto } from '../access/access.dto';
import { ProfileRepository } from '../profile/profile.repository';
import { AuthRepository } from '../auth/auth.repository';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  async approve(dto: IUserDto): Promise<void> {
    const user = await this.findOne({ id: dto.id });
    await this.save(Object.assign({}, user, { status: UserStatusType.Approved }));
  }

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async deleteUser(id: string): Promise<IUserDto> {
    const exist = await this.findOne({ id });
    if (exist) {
      this.createQueryBuilder()
        .delete()
        .from(User)
        .where("id = :id", { id })
        .execute();

      delete exist.password;
      delete exist.username;
      delete exist.salt;

      return exist;
    }
    return null;
  }

  async createUser(dto: IUserDto, curr_user: any): Promise<void> {
    await this.findOne({ username: dto.username.toLowerCase() });
  }
}


