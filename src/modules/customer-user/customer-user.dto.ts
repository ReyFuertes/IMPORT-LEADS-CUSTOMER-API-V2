import { GetDto} from "src/models/generic.model";
import { ICustomerDto } from "../customer/customer.dto";
import { Profile } from "../profile/profile.entity";

export interface ICustomerUserDto {
  id?: string;
  username?: string;
  password?: string;
  salt?: string;
  accesses?: any[];
  roles?: any[];
  customer?: ICustomerDto;
  profile?: Profile;
  created_at?: string;
  status?: number;
  is_submitted?: number;
}
export interface ICustomerUserResponseDto {

}
export class GetCustomerDto extends GetDto { }