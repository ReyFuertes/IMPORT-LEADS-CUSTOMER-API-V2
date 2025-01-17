import { IProfileDto } from "src/modules/profile/profile.dto";
import { GetDto } from "src/models/generic.model";
import { IAccessesDto } from "src/modules/accesses/accesses.dto";
import { IRolesDto } from "src/modules/roles/roles.dto";
import { ICustomerUserDto } from "../customer-user/customer-user.dto";
import { ISubscriptionDto } from "../subscription/subscription.dto";

export interface CustomerUpdateStatus {
  customer: ICustomerDto;
  status: CustomerStatusType;
}
export enum CustomerStatusType {
  Pending = 0,
  Ready = 1,
  Approved = 2,
  Cancelled = 3
}
export interface ICustomerResponseDto {
  created_at?: string;
  customer_users?: ICustomerUserDto[];
  id?: string;
  profile?: IProfileDto;
  status?: number;
  username?: string;
  subscription?: ISubscriptionDto | string,
  roles?: string[],
  access?: string[]
}
export interface ICustomerPayload {
  id?: string;
  email_password?: {
    id?: string
    username: string;
    password: string;
  },
  customer?: ICustomerUserDto;
  subscription: string;
  users?: ICustomerUserDto[];
}
export interface ICustomerDto {
  id?: string;
  username?: string;
  password?: string;
  salt?: string;
  image?: string;
  status?: CustomerStatusType;
  profile?: IProfileDto;
  customer_access?: IAccessesDto[];
  customer_role?: IRolesDto[];
  users?: ICustomerUserDto[];
  message?: string;
  create_status?: CustomerCreateStatusType;
  subscription?: string;
  text_password?: string;
  is_submitted?: number;
}
export enum CustomerCreateStatusType {
  success = 'Success',
  failed = 'Failed'
}
export class GetCustomerDto extends GetDto { }