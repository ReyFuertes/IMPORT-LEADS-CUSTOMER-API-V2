import { RolesType, GetDto, ISimpleItem } from "src/models/generic.model";
import { IAccessDto } from "../access/access.dto";
import { ICustomerDto } from "../customer/customer.dto";
import { IRolesDto } from "../roles/roles.dto";

export interface ICustomerUserDto {
  id?: string;
  username?: string;
  password?: string;
  salt?: string;
  access?: IAccessDto[] | string[];
  roles?: IRolesDto[] | string[];
  customer?: ICustomerDto;
  created_at?: string;
  status?: string;
}
export class GetCustomerDto extends GetDto { }