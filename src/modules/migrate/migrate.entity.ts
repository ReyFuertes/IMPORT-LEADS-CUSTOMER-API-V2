import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, JoinColumn, OneToMany, Unique, CreateDateColumn } from "typeorm";
import { Customer } from "../customer/customer.entity";

@Entity({ synchronize: true })
export class Migrate extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @ManyToOne(() => Customer, c => c.migrate,
    { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}