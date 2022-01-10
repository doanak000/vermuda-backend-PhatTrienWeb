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
import { EventEntity } from "./event.entity";
import { IQrmanage } from "../interfaces/qrmanage.interface";
import { PrizeEntity } from "./prize.entity";
import { SerialCodeEntity } from "./serial-code.entity";
import { UserEntity } from "./user.entity";

@Entity("QRManage")
export class QRManageEntity implements IQrmanage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  memo?: string;

  @Column()
  eventId: string;

  @ManyToOne(
    () => EventEntity,
    (event) => event.prizes,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "eventId" })
  event: EventEntity;

  @OneToMany(
    () => PrizeEntity,
    (prize) => prize.qrmanage
  )
  prizes: PrizeEntity[];

  @OneToMany(
    () => SerialCodeEntity,
    (serialCode) => serialCode.qrmanage
  )
  serialCodes: SerialCodeEntity[];

  @Column({ nullable: true })
  ownerId?: string;

  @ManyToOne(
    () => UserEntity,
    (owner) => owner.qrmanages,
    {
      onDelete: "CASCADE",
      cascade: true,
    }
  )
  @JoinColumn({ name: "ownerId" })
  owner: UserEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;
}
