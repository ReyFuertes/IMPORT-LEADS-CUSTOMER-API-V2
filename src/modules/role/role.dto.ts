import { GetDto } from "src/models/generic.model";

export interface IRoleDto {
  id?: string;
  role_name?: string;
  level?: number;
}

export class GetRoleDto extends GetDto { }