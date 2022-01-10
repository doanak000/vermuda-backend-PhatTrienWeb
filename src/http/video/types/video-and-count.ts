import { Field, ObjectType } from '@nestjs/graphql';
import { Video } from './video.type';

@ObjectType()
export class VideoAndCount {
  @Field()
  count: number;

  @Field(() => [Video])
  videos: Video[];
}
