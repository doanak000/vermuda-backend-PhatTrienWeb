import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional, MaxLength } from "class-validator";
import { User } from "../../user/types/user.type";
import { IEvent } from "../../../common/interfaces/event.interface";
import { Prize } from "./prize";
import { message } from "./../../../utils/validator-message";

@ObjectType()
export class Event implements IEvent {
  @Field()
  id: string;

  @MaxLength(100, { message: message.maxLength })
  @Field()
  name: string;

  @MaxLength(15, { message: message.maxLength })
  @Field()
  startTime: string;

  @MaxLength(15, { message: message.maxLength })
  @Field()
  endTime: string;

  @IsOptional()
  @MaxLength(200, { message: message.maxLength })
  @Field({ nullable: true })
  memo: string;

  @Field(() => [Prize], { nullable: true })
  prizes: Prize[];

  @Field(() => User)
  owner: User;

  @Field({ defaultValue: 0 })
  numberOfLotteryPeople: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
