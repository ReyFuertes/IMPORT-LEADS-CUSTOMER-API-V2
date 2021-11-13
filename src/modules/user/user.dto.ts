import { GetDto } from "src/models/generic.model";

export enum UserStatusType {
  Pending = 0,
  Approved = 1,
  Cancelled = 2
}
export interface IUserDto {
  id?: string;
  username?: string;
  password?: string;
  salt?: string;
}
export class GetUserDto extends GetDto { }