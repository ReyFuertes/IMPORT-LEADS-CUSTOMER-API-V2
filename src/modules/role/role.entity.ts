import { BaseEntity, PrimaryGeneratedColumn, Generated, Column, Entity, Unique, OneToMany } from "typeorm";
import { Roles } from '../roles/roles.entity';

@Entity({ synchronize: false })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  role_name: string;

  @Column({ nullable: true })
  level: number;

  @OneToMany(() => Roles, c => c.role, { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  roles: Roles;
}
