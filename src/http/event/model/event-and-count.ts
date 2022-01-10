import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from './event';

@ObjectType()
export class EventAndCount {
  @Field()
  count: number;

  @Field(() => [Event])
  events: Event[];
}
