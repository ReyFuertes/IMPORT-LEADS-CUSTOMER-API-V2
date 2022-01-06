import { ICustomerDto } from "src/modules/customer/customer.dto";

export interface IProfileDto {
  id?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  wechatid?: string;
  qqid?: string;
  company_name?: string;
  company_linkedin?: string;
  company_address?: string;
  self_intro?: string;
  position?: string;
  image?: string;
  customer?: ICustomerDto;
  address?: string;
  phone_number?: string;
  language?: string;
  api_url?: string;
  website_url?: string;
  database_name?: string;
}
