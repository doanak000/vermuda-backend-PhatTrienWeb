import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { VideoService } from './video.service';
import { CreateVideoInput } from './dto/create-video.input';
import { FindAll } from './dto/find-all.arg';
import { UpdateVideoInput } from './dto/update-video.intput';
import { Video } from './types/video.type';
import { VideoAndCount } from './types/video-and-count';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/interfaces/role';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from './../../common/interfaces/jwt-payload';

@Resolver(() => Video)
export class VideoResolver {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => VideoAndCount)
  async Videos(
    @CurrentUser() currentUser: JwtPayload,
    @Args() findAll: FindAll
  ): Promise<VideoAndCount> {
    return await this.videoService.findAll(currentUser.id, findAll);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Mutation(() => Video)
  async createVideo(
    @CurrentUser() currentUser: JwtPayload,
    @Args('createVideoInput') createVideoInput: CreateVideoInput
  ): Promise<Video> {
    return await this.videoService.create(currentUser, createVideoInput);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Mutation(() => Video)
  async updateVideo(
    @CurrentUser() currentUser: JwtPayload,
    @Args('updateVideoInput') updateVideoInput: UpdateVideoInput
  ): Promise<Video> {
    return await this.videoService.update(currentUser, updateVideoInput);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.admin, Role.agency, Role.client)
  @Mutation(() => Boolean)
  async deleteVideos(
    @CurrentUser() currentUser: JwtPayload,
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('softDelBySetOwnerNull', {
      type: () => [Boolean],
      defaultValue: true,
      nullable: true,
    })
    softDelBySetOwnerNull: boolean
  ): Promise<boolean> {
    return await this.videoService.deletes(
      currentUser,
      ids,
      softDelBySetOwnerNull
    );
  }
}
