import { IPrize } from "./prize.interface";
import { SerialCodeStatus } from "./serial-code-status";

export interface ISerialCode {
  code: string;
  status: SerialCodeStatus;
  expDate: Date;
  prize?: IPrize;
}
