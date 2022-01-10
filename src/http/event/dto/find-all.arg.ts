import { ArgsType, Field } from "@nestjs/graphql";
import { EventOrderByInput } from "./event-orderby.input";

@ArgsType()
export class FindAll {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  ownerId?: string;

  @Field({ nullable: true, defaultValue: 0 })
  offset?: number;

  @Field({ nullable: true, defaultValue: 10 })
  limit?: number;

  @Field({ nullable: true, defaultValue: "" })
  searchText: string;

  @Field({ nullable: true })
  isExpired?: boolean;

  @Field(() => EventOrderByInput, { nullable: true })
  orderBy?: EventOrderByInput;
}
