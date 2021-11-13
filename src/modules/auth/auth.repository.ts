import { Repository, EntityRepository, getCustomRepository } from 'typeorm';
import * as _ from 'lodash';
import { AuthCredentialDto } from './auth.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@EntityRepository(User)
export class AuthRepository extends Repository<User> {
  async signUp(dto: any, curr_customer: any): Promise<void> {
    const { username, password } = dto;
    try {
      const user = new User();
      user.username = String(username).toLowerCase();
      user.salt = await bcrypt.genSalt();
      user.password = await this.hashPassword(password, user.salt);

      await user.save();

    } catch (error) {
      throw new BadRequestException('Signup unsuccesful');
    }
  }

  async validatePassword(authCredsDto: AuthCredentialDto): Promise<any> {
    const { username, password } = authCredsDto;
    const user = await this.findOne({ username: String(username).toLowerCase() });
    if (user && await user.validatePassword(password)) {
      return user;
    } else {
      return null;
    }
  }

  async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}


