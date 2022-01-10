import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEntity } from "../../common/entities/event.entity";
import { EventResolver } from "./event.resolver";
import { EventService } from "./event.service";
import { UserEntity } from "../../common/entities/user.entity";
import { VideoEntity } from "./../../common/entities/video.entity";
import { PrizeEntity } from "../../common/entities/prize.entity";
import { SerialCodeEntity } from "../../common/entities/serial-code.entity";
import { QrmanageModule } from "../qrmanage/qrmanage.module";

@Module({
  imports: [
    QrmanageModule,
    TypeOrmModule.forFeature([
      EventEntity,
      UserEntity,
      VideoEntity,
      PrizeEntity,
      SerialCodeEntity,
    ]),
  ],
  providers: [EventService, EventResolver],
  exports: [EventService],
})
export class EventModule {}
