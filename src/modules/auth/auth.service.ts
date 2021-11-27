import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../base.service';
import { AuthCredentialDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { IUserDto } from '../user/user.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService extends BaseService<User> {
  constructor(@InjectRepository(AuthRepository) public repo: AuthRepository, private jwtSrv: JwtService) {
    super(repo);
  }

  async signIn(dto: AuthCredentialDto): Promise<any> {
    try {
      const user: IUserDto = await this.repo.validatePassword(dto);
      if (!user) {
        throw new UnauthorizedException('Invalid request!');
      } else {
        const payload = { id: user.id, username: user.username };
        const accessToken = await this.jwtSrv.sign(payload);
        
        return { accessToken, user: { id: user?.id, username: user?.username } };
      }
    } catch (error) {
      throw new BadRequestException('Invalid credentials!');
    }
  }

  async signUp(dto: AuthCredentialDto, curr_customer: any): Promise<void> {
    return this.repo.signUp(dto, curr_customer);
  }
}
