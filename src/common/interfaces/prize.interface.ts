import { ISerialCode } from "./serial-code.interface";
import { IVideo } from "./video.interface";

export interface IPrize {
  id: string;
  name?: string;
  rank: number;
  imageUrl?: string;
  numberOfCode: number;
  serialCodes: ISerialCode[];
  video: IVideo;
  createdAt: string;
  updatedAt: string;
}
