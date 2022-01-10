import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { Event } from '../model/event';

@InputType()
export class UpdateEventInput extends PartialType(
  OmitType(Event, ['owner', 'prizes', 'updatedAt', 'createdAt']),
  InputType
) {
  @Field()
  id: string;

  @Field({ nullable: true })
  numberOfLotteryPeople?: number;
}
