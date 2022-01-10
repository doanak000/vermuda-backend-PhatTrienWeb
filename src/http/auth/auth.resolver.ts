import { AuthService } from './auth.service';
import { Resolver, Args, Mutation } from '@nestjs/graphql';
import LoginInput from './dto/login.input';
import { User } from '../user/types/user.type';

@Resolver('auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User, { description: 'Login' })
  async login(@Args('loginInput') loginInput: LoginInput) {
    return await this.authService.login(loginInput);
  }

  @Mutation(() => User)
  async refreshToken(@Args('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }
}
