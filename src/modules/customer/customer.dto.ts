import { IProfileDto } from "src/modules/profile/profile.dto";
import { RolesType, GetDto } from "src/models/generic.model";
import { IAccessesDto } from "src/modules/accesses/accesses.dto";
import { IRolesDto } from "src/modules/roles/roles.dto";
import { ICustomerUserDto } from "../customer-user/customer-user.dto";

export enum CustomerStatusType {
  Pending = 0,
  Approved = 1,
  Cancelled = 2
}
export interface ICustomerResponseDto {
  created_at?: string;
  customer_users: ICustomerUserDto[];
  id?: string;
  customer_profile?: IProfileDto;
  status?: number;
  username?: string;
}
export interface ICustomerPayload {
  id?: string;
  email_password: {
    username?: string;
    password?: string;
  },
  customer_profile: {
    id?: string;
    firstname?: string;
    lastname?: string;
    phone_number?: string;
    address?: string;
    company_name?: string;
    company_address?: string;
    language?: string;
  },
  users: any[];
}
export interface ICustomerDto {
  id?: string;
  username?: string;
  password?: string;
  salt?: string;
  image?: string;
  status?: CustomerStatusType;
  customer_profile?: IProfileDto;
  customer_access?: IAccessesDto[];
  customer_role?: IRolesDto[];
  users?: ICustomerUserDto[];
}
export class GetCustomerDto extends GetDto { }