import { BaseEntity, PrimaryGeneratedColumn, Generated, Column, Entity, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Customer } from "../customer/customer.entity";
import { Subscription } from "../subscription/subscription.entity";

@Entity({ synchronize: false })
export class CustomerSubscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @OneToOne(() => Customer, c => c.customer_subscription,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToOne(() => Subscription, c => c.customer_subscription,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;
}
