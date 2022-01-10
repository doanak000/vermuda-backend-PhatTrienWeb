import { Field, InputType, OmitType } from '@nestjs/graphql';
import { Qrmanage } from '../model/qrmanage';
import { PrizeInputQR } from './prize.input';

@InputType()
export class CreateQrmanageInput extends OmitType(
  Qrmanage,
  ['id', 'prizes', 'event', 'serialCodes', 'owner', 'countSerialCodes'],
  InputType
) {
  @Field()
  eventId: string;

  @Field(() => [PrizeInputQR])
  prizes: PrizeInputQR[];
}
