import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import IUserType from './../interfaces/user-type.interface';

@Entity('UserTypeMaster')
export class UserTypeEntity implements IUserType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  role: string;

  @Column({ type: 'varchar', length: 20 })
  name: string;
}
