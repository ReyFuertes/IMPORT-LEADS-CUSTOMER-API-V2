import { IsOptional, IsNotEmpty } from 'class-validator';

export enum CustomerRoleType {
  admin = 'admin',
  manager = 'manager',
  inspector = 'inspector',
  sp = 'sp',
  client = 'client'
}

export enum sqlOp {
  eq = '=',
  like = 'like',
  iLike = 'ILIKE'
}
export class GetDto {
  @IsOptional()
  @IsNotEmpty()
  search: string;

  @IsOptional()
  take: number;
  @IsOptional()
  skip: number;
  @IsOptional()
  orderby: string;
}