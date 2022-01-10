import { Field, ObjectType } from "@nestjs/graphql";
import { ISerialCode } from "../../../common/interfaces/serial-code.interface";
import { SerialCodeStatus } from "../../../common/interfaces/serial-code-status";
import { Prize } from "./prize";
import { Event } from './event';

@ObjectType()
export class SerialCode implements ISerialCode {
  @Field()
  code: string;

  @Field(() => SerialCodeStatus)
  status: SerialCodeStatus;

  @Field(() => Prize, {nullable: true})
  prize?: Prize;

  @Field(() => Event, {nullable: true})
  event: Event;

  @Field({ nullable: true })
  expDate: Date;
}
