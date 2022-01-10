import { QrmanageResolver } from './qrmanage.resolver';
import { QrmanageService } from './qrmanage.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../../common/entities/event.entity';
import { QRManageEntity } from '../../common/entities/qrmanage.entity';
import { UserEntity } from '../../common/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, QRManageEntity, UserEntity]),
  ],
  providers: [QrmanageService, QrmanageResolver],
  exports: [QrmanageService],
})
export class QrmanageModule {}
