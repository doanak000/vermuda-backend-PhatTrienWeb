import { Field, InputType, OmitType } from '@nestjs/graphql';
import { IsOptional, MaxLength } from 'class-validator';
import { User } from '../types/user.type';
import { message } from './../../../utils/validator-message';

@InputType()
export class CreateUserInput extends OmitType(
  User,
  [
    'userType',
    'agency',
    'accessToken',
    'expiresTime',
    'refreshToken',
    'createdAt',
    'updatedAt',
  ],
  InputType,
) {
  @Field()
  userTypeId: string;

  @IsOptional()
  @MaxLength(20, { message: message.maxLength })
  @Field({ nullable: true })
  agencyId: string;

  @MaxLength(20, { message: message.maxLength })
  @Field()
  pwd: string;
}
