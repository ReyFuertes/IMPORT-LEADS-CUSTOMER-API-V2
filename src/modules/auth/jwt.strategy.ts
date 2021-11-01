import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from "./auth.dto";
import { Customer } from "src/modules/customer/customer.entity";
import { AuthRepository } from "./auth-repository";

@Injectable()
export class JwtStategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AuthRepository) public repo: AuthRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'topsecretbenbooterkooper',
    })
  }

  async validate(payload: JwtPayload): Promise<Customer> {
    const { customername } = payload;
    const customer = await this.repo.findOne({ customername });
    if (!customer) {
      throw new UnauthorizedException('Unauthorized');
    }
    return customer;
  }
}