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
  phone: string;

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

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  api_url: string;

  @Column({ nullable: true })
  database_name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @OneToOne(() => Customer, c => c.profile, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToOne(() => CustomerUser, c => c.profile, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_user_id' })
  customer_user: CustomerUser;
}