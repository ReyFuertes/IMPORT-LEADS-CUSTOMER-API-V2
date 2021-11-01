import { createParamDecorator } from "@nestjs/common";
import { Customer } from "src/modules/customer/customer.entity";

export const GetCustomer = createParamDecorator((data, req): Customer => {
  return req.customer;
});