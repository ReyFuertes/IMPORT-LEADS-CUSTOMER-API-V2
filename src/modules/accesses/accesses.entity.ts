import { BaseEntity, PrimaryGeneratedColumn, Generated, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Customer } from '../customer/customer.entity';
import { Access } from '../access/access.entity';
import { CustomerUser } from "../customer-user/customer-user.entity";

@Entity({synchronize: true })
export class Accesses extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  // @ManyToOne(() => Customer, c => c.accesses, { nullable: true, onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'customer_id' })
  // customer: Customer;

  @ManyToOne(() => CustomerUser, c => c.accesses, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_user_id' })
  customer_user: CustomerUser;

  @ManyToOne(() => Access, c => c.accesses, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'access_id' })
  access: Access;
}
