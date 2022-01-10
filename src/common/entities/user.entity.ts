import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
  BeforeRemove,
  getConnection,
  BeforeUpdate,
} from "typeorm";
import { IUser } from "../interfaces/user.interface";
import { UserTypeEntity } from "./user-type.entity";
import { EventEntity } from "./event.entity";
import { Role } from "../interfaces/role";
import { NotFoundException } from "@nestjs/common";
import { VideoEntity } from "./video.entity";
import { QRManageEntity } from "./qrmanage.entity";

@Entity({ name: "UserMaster" })
export class UserEntity implements IUser {
  @PrimaryColumn({ type: "varchar", length: 20 })
  id: string;

  @Column({ type: "varchar", length: 20, select: false })
  pwd: string;

  @Column({ type: "varchar", length: 100 })
  nameKanji: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  companyName?: string;

  @ManyToOne(() => UserTypeEntity)
  userType: UserTypeEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  agency: UserEntity;

  @OneToMany(
    () => EventEntity,
    (event) => event.owner
  )
  events: EventEntity[];

  @OneToMany(
    () => QRManageEntity,
    (event) => event.owner
  )
  qrmanages: QRManageEntity[];

  @Column({ default: -1 })
  maxClient: number;

  @Column({ type: "varchar", length: 20, nullable: true })
  tel?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  email?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  address?: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: string;

  @BeforeRemove()
  async changeAgencyToAdminIfUserIsAgency() {
    const admin = await getConnection()
      .getRepository(UserEntity)
      .createQueryBuilder("user")
      .leftJoin("user.userType", "userType")
      .where("userType.role=:userTypeName", { userTypeName: Role.admin })
      .andWhere("user.id != :currentId", { currentId: this.id })
      .getOne();
    if (!admin)
      throw new NotFoundException("The admin address was not found");
    await getConnection().transaction(async (transactionManager) => {
      await transactionManager
        .getRepository(UserEntity)
        .query(
          `UPDATE UserMaster set agencyId = '${admin.id}' where agencyId = '${this.id}'`
        );
      await transactionManager
        .getRepository(VideoEntity)
        .query(
          `UPDATE VideoMaster SET ownerId = NULL WHERE ownerId='${this.id}'`
        );
    });
  }

  @BeforeUpdate()
  async changeAgencyToAdminIfUserIsAgencyWhenUpdate() {
    if (this.userType.role == Role.client) {
      const admin = await getConnection()
        .getRepository(UserEntity)
        .createQueryBuilder("user")
        .leftJoin("user.userType", "userType")
        .where("userType.role=:userTypeName", { userTypeName: Role.admin })
        .andWhere("user.id != :currentId", { currentId: this.id })
        .getOne();
      if (!admin)
        throw new NotFoundException("The admin address was not found");
      await getConnection().transaction(async (transactionManager) => {
        await transactionManager
          .getRepository(UserEntity)
          .query(
            `UPDATE UserMaster set agencyId = '${admin.id}' where agencyId = '${this.id}'`
          );
      });
    }
  }
}
