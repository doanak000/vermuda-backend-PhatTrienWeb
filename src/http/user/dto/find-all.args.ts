import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class FindAllArg {
  @Field({ nullable: true })
  searchText: string;

  @Field({ defaultValue: 0 })
  skip: number;

  @Field({ defaultValue: 10 })
  take: number;

  @Field({ nullable: true })
  userType: string;
}
