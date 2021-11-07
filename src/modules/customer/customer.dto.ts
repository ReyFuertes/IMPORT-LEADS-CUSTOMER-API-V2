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
export interface ICustomerResponse {
  created_at?: string;
  customer_user: ICustomerDto[];
  id?: string;
  profile?: IProfileDto;
  status?: number;
  username?: string;
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