import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, JoinColumn, OneToMany, Unique, CreateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { CustomerProfile } from '../customer-profile/customer-profile.entity';
import { CustomerAccess } from '../customer-access/customer-access.entity';
import { CustomerRole } from '../customer-role/customer-role.entity';

@Entity({ synchronize: true })
@Unique(['customername'])
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  customername: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: false, default: 0 })
  status: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @OneToOne(() => CustomerProfile, c => c.customer,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  customer_profile: CustomerProfile;

  @OneToMany(() => CustomerAccess, c => c.customer,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  customer_access: CustomerAccess[];

  @OneToMany(() => CustomerRole, c => c.customer,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  customer_role: CustomerRole[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}