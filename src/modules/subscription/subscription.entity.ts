import { BaseEntity, PrimaryGeneratedColumn, Generated, Column, Entity, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { CustomerSubscription } from "../customer-subscription/customer-subscription.entity";

@Entity({synchronize: false })
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  max_users: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  rate: string;

  @Column({ nullable: true })
  is_default: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @OneToOne(() => CustomerSubscription, c => c.subscription, { eager: true, onDelete: 'CASCADE' })
  customer_subscription: CustomerSubscription;
}
