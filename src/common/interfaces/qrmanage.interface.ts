import { IEvent } from "./event.interface";
import { IPrize } from "./prize.interface";
import { IUser } from "./user.interface";

export interface IQrmanage {
  id: number;
  memo?: string;
  eventId: string;
  event: IEvent;
  prizes: IPrize[];
  ownerId?: string;
  owner?: IUser;
}
