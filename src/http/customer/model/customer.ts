import { Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsOptional } from 'class-validator';
import { ICustomer } from './../../../common/interfaces/customer.interface';
import { message } from './../../../utils/validator-message';

@ObjectType()
export class Customer implements ICustomer {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  tel: string;

  @IsOptional()
  @IsEmail({}, { message: message.isEmail })
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  address: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
