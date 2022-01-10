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
import { IPrize } from "./../interfaces/prize.interface";
import { EventEntity } from "./event.entity";
import { VideoEntity } from "./video.entity";
import { SerialCodeEntity } from "./serial-code.entity";
import { QRManageEntity } from "./qrmanage.entity";

@Entity("PrizeMaster")
export class PrizeEntity implements IPrize {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column()
  rank: number;

  @Column({ default: 0 })
  numberOfCode: number;

  @Column({ nullable: true, length: 2000 })
  imageUrl?: string;

  @Column({ nullable: true })
  videoId: string;

  @ManyToOne(() => VideoEntity)
  @JoinColumn({ name: "videoId" })
  video: VideoEntity;

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
    () => SerialCodeEntity,
    (serialCodes) => serialCodes.prize,
    { cascade: true }
  )
  serialCodes: SerialCodeEntity[];

  @Column()
  qrmanageId: number;

  @ManyToOne(
    () => QRManageEntity,
    (qrmanage) => qrmanage.prizes
  )
  @JoinColumn({ name: "qrmanageId" })
  qrmanage: QRManageEntity;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;
}
