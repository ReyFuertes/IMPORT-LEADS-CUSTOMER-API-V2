import { GetDto } from "src/models/generic.model";
import { IAccessDto } from "../access/access.dto";

export interface IAccessesDto {
  id?: string;
  customer?: { id: string };
  access?: IAccessDto;
}

export class GetCustomerAccesDto extends GetDto { }