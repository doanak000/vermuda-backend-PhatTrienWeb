import { Field, InputType, OmitType } from "@nestjs/graphql";
import { Event } from "../model/event";
import { PrizeInput } from "./prize.input";

@InputType()
export class CreateEventInput extends OmitType(
  Event,
  ["id", "owner", "prizes", "createdAt", "updatedAt"],
  InputType
) {
  @Field(() => [PrizeInput])
  prizes: PrizeInput[];
}
