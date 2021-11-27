import { BaseEntity, PrimaryGeneratedColumn, Generated, Column, Entity, Unique, OneToMany } from "typeorm";

@Entity({synchronize: false })
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  value: number;

  @Column({ nullable: true })
  max_users: number;

  @Column({ nullable: true })
  description: number;

  @Column({ nullable: true })
  is_default: boolean;
}
