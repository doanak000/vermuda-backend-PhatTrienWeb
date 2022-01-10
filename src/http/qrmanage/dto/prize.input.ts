import { Field, InputType } from "@nestjs/graphql";
import { SerialCode } from "../../../http/event/model/serial-code";
import { IPrize } from "../../../common/interfaces/prize.interface";
import { Video } from "../../video/types/video.type";

@InputType()
export class PrizeInputQR implements IPrize {
  @Field()
  id: string;

  @Field({ defaultValue: 0 })
  numberOfCode: number;

  name?: string;
  rank: number;
  imageUrl?: string;
  videoId: string;
  video: Video;
  createdAt: string;
  updatedAt: string;
  numberOfWinner: number;
  serialCodes: SerialCode[];
}
