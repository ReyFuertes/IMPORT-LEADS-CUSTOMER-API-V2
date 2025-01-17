import { GetDto } from "src/models/generic.model";
import { IRoleDto } from "src/modules/role/role.dto";
import { ICustomerDto } from "src/modules/customer/customer.dto";

export interface IRolesDto {
  id?: string;
  role?: IRoleDto;
  customer?: ICustomerDto
}

export class GetRolesDto extends GetDto { }