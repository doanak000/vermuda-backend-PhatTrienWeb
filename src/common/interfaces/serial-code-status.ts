import { registerEnumType } from '@nestjs/graphql';

export enum SerialCodeStatus {
  valid = 'valid',
  invalid = 'invalid',
}

registerEnumType(SerialCodeStatus, {
  name: 'SerialCodeStatus',
});
