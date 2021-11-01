import { IsString, MinLength, MaxLength } from "class-validator";

export interface ICustomerAuthDto {
  accessToken: string,
  customer: {
    id: string,
    customername: string,
    image: string
  }
}
export interface JwtPayload {
  customername: string;
}
export class AuthCredentialDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  customername: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  password: string;
}