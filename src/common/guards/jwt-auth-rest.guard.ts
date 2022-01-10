import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthRestGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super(reflector);
  }

  handleRequest(err, user, info, context) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return user;
    }

    if (!roles.some(item => item === user.role)) {
      throw err || new ForbiddenException();
    }

    return user;
  }
}
