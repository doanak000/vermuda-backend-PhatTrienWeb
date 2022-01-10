import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../common/entities/user.entity';
import { UserTypeEntity } from './../../common/entities/user-type.entity';
import { UserResolver } from './user.resolver';
import { QRManageEntity } from '../../common/entities/qrmanage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserTypeEntity, QRManageEntity]),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
