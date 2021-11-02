import { ICustomerProfileDto } from "src/modules/customer-profile/customer-profile.dto";
import { CustomerRoleType, GetDto } from "src/models/generic.model";
import { ICustomerAccessDto } from "src/modules/customer-access/customer-access.dto";
import { ICustomerRoleDto } from "src/modules/customer-role/customer-role.dto";

export enum CustomerStatusType {
  Pending = 0,
  Approved = 1,
  Cancelled = 2
}
export interface ICustomerDto {
  id?: string;
  username?: string;
  password?: string;
  salt?: string;
  status?: CustomerStatusType;
  customer_profile?: ICustomerProfileDto;
  customer_access?: ICustomerAccessDto[];
  customer_role?: ICustomerRoleDto[];
}
export class GetCustomerDto extends GetDto { }