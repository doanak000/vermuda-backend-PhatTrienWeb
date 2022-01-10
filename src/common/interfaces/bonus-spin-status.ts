import { registerEnumType } from '@nestjs/graphql';

export enum BonusSpinStatus {
  confirmed = 'confirmed',
  pending = 'pending',
}

registerEnumType(BonusSpinStatus, {
  name: 'BonusSpinStatus',
});
