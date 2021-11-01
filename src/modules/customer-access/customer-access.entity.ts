import { BaseEntity, PrimaryGeneratedColumn, Generated, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Customer } from '../customer/customer.entity';
import { Access } from '../access/access.entity';

@Entity({ synchronize: true })
export class CustomerAccess extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @ManyToOne(() => Customer, c => c.customer_access, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Access, c => c.customer_access, { eager: true, nullable: true, onDelete: 'CASCADE' })
  access: Access;
}
