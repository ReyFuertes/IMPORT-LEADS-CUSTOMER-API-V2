import { ICustomerDto } from "src/modules/customer/customer.dto";
import * as moment from 'moment';

export const logToConsole = (str: string, customer: ICustomerDto) => {
  console.log(`${moment(new Date()).format('MM-DD-YYYY hh:mm')}: [${customer?.username}] ${str}`);
}

const getFullname = (customer: ICustomerDto): string => {
  return `${customer?.profile?.firstname} ${customer?.profile?.lastname}`;
}