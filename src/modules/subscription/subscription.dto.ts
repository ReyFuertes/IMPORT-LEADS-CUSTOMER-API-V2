import { GetDto } from "src/models/generic.model";

export interface ISubscriptionDto {
  id?: string;
  label?: string;
  value?: number;
  max_users?: number;
  description?: string;
  is_default?: boolean;
}

export class GetSubscriptionDto extends GetDto { }