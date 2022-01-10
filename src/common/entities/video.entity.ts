import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IVideo } from './../interfaces/video.interface';
import { UserEntity } from './user.entity';

@Entity('VideoMaster')
export class VideoEntity implements IVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ length: 2000 })
  url: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: string;

  @ManyToOne(() => UserEntity)
  owner: UserEntity;
}
