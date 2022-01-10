import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsUrl, MaxLength } from "class-validator";
import { IPrize } from "../../../common/interfaces/prize.interface";
import { SerialCode } from "../model/serial-code";
import { message } from "./../../../utils/validator-message";
import { Video } from "../../video/types/video.type";

@InputType()
export class PrizeInput implements IPrize {
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  rank: number;

  @Field({ defaultValue: 0 })
  numberOfCode: number;

  @IsOptional()
  @MaxLength(2000, { message: message.maxLength })
  @IsUrl({}, { message: message.isUrl })
  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  videoId: string;

  video: Video;
  createdAt: string;
  updatedAt: string;
  numberOfWinner: number;
  serialCodes: SerialCode[];
}
