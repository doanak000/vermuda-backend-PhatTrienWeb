import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import LoginInput from './dto/login.input';
import { TokenType } from '../../common/interfaces/token-type';
import { UserService } from '../user/user.service';
import { User } from '../user/types/user.type';
import { JwtPayload } from './../../common/interfaces/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(id: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneById(id);
    if (user && user.pwd === pass) {
      delete user.pwd;
      return user;
    }
    return null;
  }

  async login(loginInput: LoginInput) {
    const user = await this.usersService.findOneById(loginInput.id);
    if (!user || user.pwd !== loginInput.password) {
      throw new BadRequestException('ID or the password is invalid');
    }

    const payload: JwtPayload = {
      id: user.id + '',
      role: user.userType.role,
      type: TokenType.access_token,
    };

    const payloadRefresh: JwtPayload = {
      id: user.id + '',
      role: user.userType.role,
      type: TokenType.refresh_token,
    };

    return {
      ...user,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payloadRefresh, {
        algorithm: 'HS384',
        expiresIn: '30d',
      }),
    };
  }

  async refreshToken(refreshToken: string): Promise<User> {
    try {
      const payload = this.jwtService.decode(refreshToken);
      const user = await this.usersService.findOneById(payload['id']);

      const newPayload: JwtPayload = {
        id: payload['id'],
        role: payload['role'],
        type: TokenType.access_token,
      };

      if (this.jwtService.verify(refreshToken)) {
        return {
          ...user,
          accessToken: this.jwtService.sign(newPayload),
        };
      } else {
        throw new ForbiddenException('Token renewal is invalid.');
      }
    } catch (err) {
      throw new ForbiddenException('Token renewal is invalid.');
    }
  }
}
