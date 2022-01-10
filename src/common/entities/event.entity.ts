import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IEvent } from "../interfaces/event.interface";
import { UserEntity } from "./user.entity";
import { PrizeEntity } from "./prize.entity";
import { QRManageEntity } from "./qrmanage.entity";
import { SerialCodeEntity } from "./serial-code.entity";

@Entity("EventMaster")
export class EventEntity implements IEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 15 })
  startTime: string;

  @Column()
  ownerId: string;

  @ManyToOne(
    () => UserEntity,
    (owner) => owner.events,
    {
      onDelete: "CASCADE",
      cascade: true,
    }
  )
  @JoinColumn({ name: "ownerId" })
  owner: UserEntity;

  @Column({ type: "varchar", length: 15 })
  endTime: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  memo: string;

  @Column({ default: 0 })
  numberOfLotteryPeople: number;

  @OneToMany(
    () => PrizeEntity,
    (prizes) => prizes.event,
    { cascade: true }
  )
  prizes: PrizeEntity[];

  @OneToMany(
    () => QRManageEntity,
    (qrmanage) => qrmanage.event,
    { cascade: true }
  )
  qrmanages: QRManageEntity[];

  @OneToMany(
    () => SerialCodeEntity,
    (prizes) => prizes.event,
    { cascade: true }
  )
  serialCodes: SerialCodeEntity[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;
}
