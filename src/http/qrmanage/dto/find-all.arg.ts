import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class FindAll {
  @Field({ nullable: true })
  eventId?: string;

  @Field({ nullable: true })
  qrmanageId?: number;

  @Field({ nullable: true, defaultValue: 0 })
  offset?: number;

  @Field({ nullable: true, defaultValue: 10 })
  limit?: number;

  @Field({ nullable: true, defaultValue: "" })
  searchText?: string;
}
