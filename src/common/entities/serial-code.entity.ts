import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ISerialCode } from "../interfaces/serial-code.interface";
import { SerialCodeStatus } from "../interfaces/serial-code-status";
import { PrizeEntity } from "./prize.entity";
import { EventEntity } from "./event.entity";
import { QRManageEntity } from './qrmanage.entity';

@Entity("SerialCode")
export class SerialCodeEntity implements ISerialCode {
  @PrimaryColumn()
  code: string;

  @Column({ type: "timestamp" })
  expDate: Date;

  @Column({
    type: "enum",
    enum: SerialCodeStatus,
    default: SerialCodeStatus.valid,
  })
  status: SerialCodeStatus;

  @Column()
  prizeId: string;

  @ManyToOne(
    () => PrizeEntity,
    (prize) => prize.serialCodes,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "prizeId" })
  prize: PrizeEntity;

  @Column()
  eventId: string;

  @ManyToOne(
    () => EventEntity
  )
  @JoinColumn({ name: "eventId" })
  event: EventEntity;

  @Column()
  qrmanageId: number;

  @ManyToOne(
    () => QRManageEntity,
  )
  @JoinColumn({ name: "qrmanageId" })
  qrmanage: QRManageEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;
}
