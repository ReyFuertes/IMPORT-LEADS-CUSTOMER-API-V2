import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../base.service';
import { AuthCredentialDto, ICustomerAuthDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { Customer } from '../customer/customer.entity';
import { ICustomerDto } from '../customer/customer.dto';

@Injectable()
export class AuthService extends BaseService<Customer> {
  constructor(@InjectRepository(AuthRepository) public repo: AuthRepository, private jwtSrv: JwtService) {
    super(repo);
  }

  async signIn(dto: AuthCredentialDto): Promise<ICustomerAuthDto> {
    try {
      const customer: ICustomerDto = await this.repo.validatePassword(dto);
      if (!customer) {
        throw new UnauthorizedException('Invalid request!');
      } else {
        const payload = { id: customer.id, username: customer.username };
        const accessToken = await this.jwtSrv.sign(payload);

        return { accessToken, customer: { id: customer?.id, username: customer?.username, image: customer?.customer_profile?.image } };
      }
    } catch (error) {
      throw new BadRequestException('Invalid credentials!');
    }
  }

  async signUp(dto: AuthCredentialDto, curr_customer: any): Promise<any[]> {
    return this.repo.signUp(dto, curr_customer);
  }
}
