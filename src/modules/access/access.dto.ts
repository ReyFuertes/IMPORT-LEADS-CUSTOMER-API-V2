import { GetDto } from "src/models/generic.model";

export interface IAccessDto {
  id?: string;
  access_name?: string;
  route?: string;
}

export class GetAccesDto extends GetDto { }