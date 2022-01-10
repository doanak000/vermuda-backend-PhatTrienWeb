import { InputType, OmitType } from '@nestjs/graphql';
import { Video } from './../types/video.type';

@InputType()
export class UpdateVideoInput extends OmitType(
  Video,
  ['createdAt', 'updatedAt', 'owner'],
  InputType,
) {}
