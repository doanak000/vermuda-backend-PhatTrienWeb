import { UseGuards } from '@nestjs/common';
import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from './../../common/interfaces/jwt-payload';
import { Role } from '../../common/interfaces/role';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from './types/user.type';
import { UserService } from './user.service';
import { UpdateUserInput } from './dto/update-user.input';
import { UserAndCount } from './types/user-and-count.type';
import { FindAllArg } from './dto/find-all.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async user(
    @CurrentUser() currentUser,
    @Args('id') id: string,
  ): Promise<User> {
    return await this.userService.findOne(currentUser, id);
  }

  @Roles(Role.admin, Role.agency)
  @Query(() => UserAndCount)
  async users(
    @CurrentUser() currentUser: JwtPayload,
    @Args() findOption: FindAllArg,
  ): Promise<UserAndCount> {
    return await this.userService.findAll(currentUser, findOption);
  }

  @Roles(Role.admin, Role.agency)
  @Mutation(() => User)
  async createUser(
    @CurrentUser() currentUser: JwtPayload,
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return await this.userService.create(currentUser, createUserInput);
  }

  @Roles(Role.admin, Role.agency)
  @Mutation(() => User)
  async updateUser(
    @CurrentUser() currentUser: JwtPayload,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return await this.userService.update(currentUser, updateUserInput);
  }

  @Roles(Role.admin, Role.agency)
  @Mutation(() => Boolean)
  async deleteUser(
    @CurrentUser() currentUser: JwtPayload,
    @Args('id') id: string,
  ) {
    return await this.userService.delete(currentUser, id);
  }

  @Roles(Role.admin, Role.agency)
  @Mutation(() => Boolean)
  async deletesUser(
    @CurrentUser() currentUser: JwtPayload,
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<boolean> {
    return await this.userService.deletes(currentUser, ids);
  }
}
