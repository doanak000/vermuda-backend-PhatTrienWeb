import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoResolver } from './video.resolver';
import { VideoService } from './video.service';
import { VideoEntity } from './../../common/entities/video.entity';
import { UserEntity } from './../../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VideoEntity, UserEntity]), UserModule],
  providers: [VideoResolver, VideoService],
  exports: [],
})
export class VideoModule {}
