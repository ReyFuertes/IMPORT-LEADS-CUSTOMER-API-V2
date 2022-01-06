import { BaseEntity, Column, Entity,  Generated,  PrimaryGeneratedColumn,  Unique } from "typeorm";

@Entity({ synchronize: true })
@Unique(['app_token'])
export class UserToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  app_token: string;
}