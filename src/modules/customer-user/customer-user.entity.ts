import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, JoinColumn, OneToMany, Unique, CreateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { Profile } from '../profile/profile.entity';
import { Accesses } from '../accesses/accesses.entity';
import { Roles } from '../roles/roles.entity';
import { Customer } from "../customer/customer.entity";

@Entity({ synchronize: false })
export class CustomerUser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  text_password: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: true, default: 0 })
  status: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @ManyToOne(() => Customer, c => c.customer_user,
    { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToOne(() => Profile, c => c.customer_user,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  profile: Profile;

  @Column({ nullable: false, default: 0 })
  is_submitted: number;

  @OneToMany(() => Accesses, c => c.customer_user,
    { nullable: true })
  accesses: Accesses[];

  @OneToMany(() => Roles, c => c.customer_user,
    { nullable: true })
  roles: Roles[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}