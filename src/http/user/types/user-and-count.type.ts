import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.type';

@ObjectType()
export class UserAndCount {
  @Field()
  count: number;

  @Field(() => [User])
  users: User[];
}
