import { GetDto } from "src/models/generic.model";
import { ISubscriptionDto } from "../subscription/subscription.dto";

export interface ICustomerSubscriptionDto {
  id?: string;
  label?: string;
  value?: number;
  max_users?: number;
  description?: string;
  is_default?: boolean;
  subscription?: ISubscriptionDto
}

export class GetCustomerSubscriptionDto extends GetDto { }