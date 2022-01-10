import { IPrize } from "./prize.interface";

export interface IEvent {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  memo: string;
  numberOfLotteryPeople: number;
  prizes: IPrize[];
  createdAt: string;
  updatedAt: string;
}
