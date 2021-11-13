import { UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context) {
    console.log('handleRequest', err)

    const allowAny = this.reflector.get<string[]>('allow-any', context.getHandler());
    if (user) return user;
    if (allowAny) return true;
    throw new UnauthorizedException();
  }
}