import { InputType, OmitType } from '@nestjs/graphql';
import { Video } from './../types/video.type';

@InputType()
export class CreateVideoInput extends OmitType(
  Video,
  ['id', 'createdAt', 'updatedAt', 'owner'],
  InputType,
) {}
