import { GetDto } from "src/models/generic.model";

export interface ICustomerSubscriptionDto {
  id?: string;
  label?: string;
  value?: number;
  max_users?: number;
  description?: string;
  is_default?: boolean;
}

export class GetCustomerSubscriptionDto extends GetDto { }