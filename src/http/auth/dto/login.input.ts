import { InputType, Field } from '@nestjs/graphql';

@InputType()
export default class LoginInput {
  @Field()
  id: string;

  @Field()
  password: string;
}
