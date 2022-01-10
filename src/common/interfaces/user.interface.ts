export interface IUser {
  id: string;
  pwd: string;
  nameKanji: string;
  companyName?: string;
  tel?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  maxClient: number;
}
