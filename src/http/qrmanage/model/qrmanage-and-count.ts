import { Field, ObjectType } from '@nestjs/graphql';
import { Qrmanage } from './qrmanage';

@ObjectType()
export class QrmanageAndCount {
  @Field()
  count: number;

  @Field(() => [Qrmanage])
  qrmanages: Qrmanage[];
}
