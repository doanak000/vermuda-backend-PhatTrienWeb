import { Field, ObjectType } from "@nestjs/graphql";
import { IUser } from "../../../common/interfaces/user.interface";
import { UserType } from "./user-type.type";
import { MaxLength, IsOptional } from "class-validator";
import { message } from "./../../../utils/validator-message";

@ObjectType()
export class User implements IUser {
  @MaxLength(20, { message: message.maxLength })
  @Field()
  id: string;

  @MaxLength(20, { message: message.maxLength })
  @Field({ nullable: true })
  pwd: string;

  @MaxLength(100, { message: message.maxLength })
  @Field()
  nameKanji: string;

  @IsOptional()
  @MaxLength(500, { message: message.maxLength })
  @Field({ nullable: true })
  companyName?: string;

  @Field(() => UserType)
  userType: UserType;

  @Field(() => User, { nullable: true })
  agency: User;

  @IsOptional()
  @MaxLength(20, { message: message.maxLength })
  @Field({ nullable: true })
  tel?: string;

  @IsOptional()
  @MaxLength(100, { message: message.maxLength })
  @Field({ nullable: true })
  email?: string;

  @IsOptional()
  @MaxLength(500, { message: message.maxLength })
  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  expiresTime?: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field({ nullable: true, defaultValue: -1 })
  maxClient: number;
}
