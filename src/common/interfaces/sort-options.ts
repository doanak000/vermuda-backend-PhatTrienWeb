import { registerEnumType } from '@nestjs/graphql';

export enum SortOptions {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOptions, {
  name: 'SortOptions',
});
