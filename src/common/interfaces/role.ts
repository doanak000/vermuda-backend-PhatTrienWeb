import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  admin = 'admin',
  agency = 'agency',
  client = 'client',
}

registerEnumType(Role, {
  name: 'Role',
});
