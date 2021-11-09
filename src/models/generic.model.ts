import { IsOptional, IsNotEmpty } from 'class-validator';

export interface ISimpleItem {
  label: string;
  value: string;
}
export enum RolesType {
  sp = 'sp',
  client = 'client',
  manager = 'manager',
  inspector = 'inspector',
  admin = 'admin',
  master = 'master'
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