import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsUrl, MaxLength } from 'class-validator';
import { IPrize } from './../../../common/interfaces/prize.interface';
import { Video } from './../../video/types/video.type';
import { message } from './../../../utils/validator-message';
import { SerialCode } from './serial-code';

@ObjectType()
export class Prize implements IPrize {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  rank: number;

  @Field({ defaultValue: 0 })
  numberOfCode: number;

  @IsOptional()
  @IsUrl({}, { message: message.isUrl })
  @MaxLength(2000)
  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  video: Video;

  @Field(() => [SerialCode], { nullable: true })
  serialCodes: SerialCode[];

  @Field(() => Int, { defaultValue: 0, nullable: true })
  countSerialCodes?: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
