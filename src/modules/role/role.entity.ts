import { BaseEntity, PrimaryGeneratedColumn, Generated, Column, Entity, Unique, OneToMany } from "typeorm";
import { CustomerRole } from '../customer-role/customer-role.entity';

@Entity({ synchronize: false })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  role_name: string;

  @Column({ nullable: true })
  level: number;

  @OneToMany(() => CustomerRole, c => c.customer, { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  customer_role: CustomerRole;
}
