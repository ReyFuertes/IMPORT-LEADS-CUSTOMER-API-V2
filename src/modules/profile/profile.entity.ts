import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, CreateDateColumn, JoinColumn } from "typeorm";
import { Customer } from "src/modules/customer/customer.entity";
import { CustomerUser } from "../customer-user/customer-user.entity";

@Entity({ synchronize: false })
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  firstname: string;

  @Column({ nullable: true })
  lastname: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  wechatid: string;

  @Column({ nullable: true })
  qqid: string;
  
  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  company_linkedin: string;
  
  @Column({ nullable: true })
  company_address: string;
  
  @Column({ nullable: true })
  self_intro: string;
  
  @Column({ nullable: true })
  position: string;
  
  @Column({ nullable: true })
  image: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @ManyToOne(() => Customer, c => c.customer_profile, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => CustomerUser, c => c.customer_user_profile, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_user_id' })
  customer_user: CustomerUser;
}