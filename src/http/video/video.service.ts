import { Role } from './../../common/interfaces/role';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Repository } from 'typeorm';
import { CreateVideoInput } from './dto/create-video.input';
import { FindAll } from './dto/find-all.arg';
import { assignPartial } from './../../utils/utils';
import { UpdateVideoInput } from './dto/update-video.intput';
import { Video } from './types/video.type';
import { VideoEntity } from './../../common/entities/video.entity';
import { VideoAndCount } from './types/video-and-count';
import { JwtPayload } from './../../common/interfaces/jwt-payload';
import { UserEntity } from './../../common/entities/user.entity';
import { PrizeEntity } from '../../common/entities/prize.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly videoEntity: Repository<VideoEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    private readonly userService: UserService
  ) {}

  canUpdateOrDelete(currentUser: JwtPayload, video: VideoEntity) {
    if (currentUser.id === video.owner?.id) {
      return true;
    }
    if (currentUser.role === 'admin') {
      return true;
    }
    if (currentUser.role === 'agency') {
      if (video.owner?.agency.id === currentUser.id) {
        return true;
      }
    }
    return false;
  }

  async findAll(
    currentUserId: string,
    { name, offset, limit }: FindAll
  ): Promise<VideoAndCount> {
    try {
      const ownerIds = [];

      const user = await this.userEntity.findOne(currentUserId, {
        relations: ['agency', 'userType'],
      });

      if (user.userType.role == Role.agency) {
        const clientsOfAgency = await this.userEntity.find({
          where: {
            agency: {
              id: user.id,
            },
          },
        });
        clientsOfAgency.forEach((client) => {
          ownerIds.push(client.id);
        });
      }

      if (user.userType.role == Role.client) {
        ownerIds.push(user.agency.id);
      }

      const queryVideo = this.videoEntity
        .createQueryBuilder('video')
        .skip(offset)
        .take(limit)
        .orderBy({ 'video.createdAt': 'DESC' })
        .leftJoinAndSelect('video.owner', 'owner')
        .where('owner.id IS NOT NULL');

      if (name)
        queryVideo.where('LOWER(video.name) LIKE :name', {
          name: `%${name}%`,
        });

      if (user.userType.role !== Role.admin) {
        const admin = await this.userService.getAdmin();
        ownerIds.push(admin.id);
        ownerIds.push(user.id);
        queryVideo.andWhere('video.ownerId IN (:...ownerIds) ', {
          ownerIds,
        });
      }

      queryVideo.andWhere('video.ownerId IS NOT NULL');

      const [videos, count] = await queryVideo.getManyAndCount();
      return {
        videos,
        count,
      };
    } catch (error) {
      throw error;
    }
  }

  async create(
    currentUser: JwtPayload,
    createVideoInput: CreateVideoInput
  ): Promise<Video> {
    try {
      const owner = await this.userEntity.findOne(currentUser.id);
      const video = new VideoEntity();
      assignPartial(video, createVideoInput);
      video.owner = owner;
      return await this.videoEntity.save(video);
    } catch (error) {
      throw error;
    }
  }

  async update(
    currentUser: JwtPayload,
    updateVideoInput: UpdateVideoInput
  ): Promise<Video> {
    try {
      const video = await this.videoEntity.findOne(updateVideoInput.id, {
        relations: ['owner', 'owner.agency'],
      });
      if (!this.canUpdateOrDelete(currentUser, video))
        throw new ForbiddenException(` ${video.name}Cannot be updated.`);
      if (!video) throw new NotFoundException('The video was not found');
      assignPartial(video, updateVideoInput);
      return await this.videoEntity.save(video);
    } catch (error) {
      throw error;
    }
  }

  async deletes(
    currentUser: JwtPayload,
    ids: string[],
    softDelBySetOwnerNull: boolean
  ): Promise<boolean> {
    try {
      if (!ids.length) throw new NotFoundException('Not found');
      const videos = await this.videoEntity
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.owner', 'owner')
        .leftJoinAndSelect('owner.agency', 'agency')
        .where('video.id in (:...ids)', { ids })
        .getMany();
      videos.forEach((video) => {
        if (!this.canUpdateOrDelete(currentUser, video)) {
          throw new ForbiddenException(` ${video.name} can not delete`);
        }

        if (softDelBySetOwnerNull) {
          video.owner = null;
        }
      });
      const videoIds = (await this.videoEntity.findByIds(ids)).map(
        (item) => item.id
      );
      const differenceIds = _.difference(ids, videoIds);
      if (differenceIds.length)
        throw new NotFoundException(
          `ID ${differenceIds.join(',')} Video was not found`
        );

      if (softDelBySetOwnerNull) {
        await this.videoEntity.save(videos);

        const videosNotInPrize = await this.videoEntity
          .createQueryBuilder('video')
          .leftJoinAndSelect(
            (subQb) => {
              return subQb.select('id, videoId').from(PrizeEntity, 'PE');
            },
            'prize',
            '`prize`.`videoId` = video.id'
          )
          .where('prize.videoId IS NULL')
          .andWhereInIds(videoIds)
          .getMany();
        if (videosNotInPrize.length)
          await this.videoEntity.remove(videosNotInPrize);
      } else {
        await this.videoEntity.delete(ids);
      }

      return true;
    } catch (error) {
      if (
        error.message.includes('ER_ROW_IS_REFERENCED') &&
        error.message.includes('PrizeMaster')
      )
        throw new BadRequestException(
          'This video is used in prizes and cannot be deleted.'
        );
      throw error;
    }
  }
}
