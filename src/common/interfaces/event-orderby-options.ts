import { registerEnumType } from '@nestjs/graphql';

export enum EventOrderByOptions {
  createdAt = 'createdAt',
  numberOfLotteryPeople = 'numberOfLotteryPeople',
}

registerEnumType(EventOrderByOptions, { name: 'EventOrderByOptions' });
