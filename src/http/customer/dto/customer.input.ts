import { InputType, OmitType } from '@nestjs/graphql';
import { Customer } from './../model/customer';

@InputType()
export class CustomerInput extends OmitType(
  Customer,
  ['id', 'createdAt', 'updatedAt'],
  InputType,
) {}
