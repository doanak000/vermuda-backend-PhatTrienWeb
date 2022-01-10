import { Field, InputType } from '@nestjs/graphql';
import { EventOrderByOptions } from '../../../common/interfaces/event-orderby-options';
import { SortOptions } from '../../../common/interfaces/sort-options';

@InputType()
export class EventOrderByInput {
  @Field(() => EventOrderByOptions, { nullable: true })
  field: EventOrderByOptions;

  @Field(() => SortOptions, { nullable: true })
  direction: SortOptions;
}
