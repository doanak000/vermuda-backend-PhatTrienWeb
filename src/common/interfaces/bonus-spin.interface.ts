import { BonusSpinStatus } from './bonus-spin-status';
export interface IBonusSpin {
  id: string;
  code: string;
  status: BonusSpinStatus;
  createdAt: string;
}
