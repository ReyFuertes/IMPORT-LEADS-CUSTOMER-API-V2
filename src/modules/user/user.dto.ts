import { GetDto } from "src/models/generic.model";

export enum UserStatusType {
  Pending = 0,
  Approved = 1,
  Cancelled = 2
}
export interface IUserDto extends IUserAttribute{
  id?: string;
  username?: string;
  password?: string;
  salt?: string;
  created_at?: string;
 
}
export interface IUserAttribute {
  is_master_admin?: boolean;
  create_admin_token?: string;
  create_admin?: boolean;
}
export class GetUserDto extends GetDto { }