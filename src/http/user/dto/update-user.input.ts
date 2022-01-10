import { InputType, OmitType, Field } from '@nestjs/graphql';
import { IsOptional, MaxLength } from 'class-validator';
import { User } from '../types/user.type';
import { message } from './../../../utils/validator-message';

@InputType()
export class UpdateUserInput extends OmitType(
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
  @Field({ nullable: true })
  userTypeId: string;

  @IsOptional()
  @MaxLength(20, { message: message.maxLength })
  @Field({ nullable: true })
  agencyId: string;
  id: string;
}
