import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsUrl, MaxLength } from 'class-validator';
import { IVideo } from './../../../common/interfaces/video.interface';
import { User } from './../../user/types/user.type';
import { message } from './../../../utils/validator-message';

@ObjectType()
export class Video implements IVideo {
  @Field()
  id: string;

  @IsOptional()
  @MaxLength(100, { message: message.maxLength })
  @Field({ nullable: true })
  name: string;

  @MaxLength(2000, { message: message.maxLength })
  @IsUrl({}, { message: message.isUrl })
  @Field()
  url: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field({ nullable: true })
  owner: User;
}
