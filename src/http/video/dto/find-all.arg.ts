import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class FindAll {
  @Field({ nullable: true })
  name: string;

  @Field({ defaultValue: 0 })
  offset: number;

  @Field({ defaultValue: 10 })
  limit: number;

  @Field({ defaultValue: false })
  isGetOwner: boolean;
}
