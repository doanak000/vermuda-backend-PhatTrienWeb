import { Field, ObjectType } from '@nestjs/graphql';
import { SerialCode } from '../../event/model/serial-code';
import { IQrmanage } from '../../../common/interfaces/qrmanage.interface';
import { Event } from '../../event/model/event';
import { Prize } from '../../event/model/prize';
import { User } from '../../user/types/user.type';

@ObjectType()
export class Qrmanage implements IQrmanage {
  @Field()
  id: number;

  @Field({ nullable: true })
  memo?: string;

  @Field()
  eventId: string;

  @Field(() => Event)
  event: Event;

  @Field(() => [Prize])
  prizes: Prize[];

  @Field({ nullable: true })
  ownerId?: string;

  @Field(() => User, { nullable: true })
  owner?: User;

  @Field(() => [SerialCode])
  serialCodes: SerialCode[];

  @Field({ defaultValue: 0 })
  countSerialCodes: number;

  @Field()
  expDate: Date;
}
