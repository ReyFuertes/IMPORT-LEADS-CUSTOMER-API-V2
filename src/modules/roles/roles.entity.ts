import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, JoinColumn } from "typeorm";
import { Customer } from "src/modules/customer/customer.entity";
import { Role } from "src/modules/role/role.entity";
import { CustomerUser } from "../customer-user/customer-user.entity";

@Entity({ synchronize: false })
export class Roles extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @ManyToOne(() => Role, c => c.roles, { nullable: true, eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Customer, c => c.roles, { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => CustomerUser, c => c.roles, { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_user_id' })
  customer_user: CustomerUser;
}