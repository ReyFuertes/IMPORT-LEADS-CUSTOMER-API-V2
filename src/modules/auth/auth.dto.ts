import { IsString, MinLength, MaxLength } from "class-validator";

export interface IUserAuthDto {
  accessToken: string,
  user: {
    id: string,
    username: string,
    image: string
  }
}
export interface JwtPayload {
  username: string;
}
export class AuthCredentialDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  username: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  password: string;
}