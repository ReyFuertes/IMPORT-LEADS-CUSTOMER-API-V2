import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, JoinColumn, OneToMany, Unique, CreateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { Profile } from '../profile/profile.entity';
import { Accesses } from '../accesses/accesses.entity';
import { Roles } from '../roles/roles.entity';
import { CustomerUser } from "../customer-user/customer-user.entity";
import { Migrate } from "../migrate/migrate.entity";

@Entity({synchronize: true })
@Unique(['username'])
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: false, default: 0 })
  status: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @OneToOne(() => Profile, c => c.customer,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  profile: Profile;

  @OneToMany(() => CustomerUser, c => c.customer, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  customer_user: CustomerUser;

  @OneToMany(() => Migrate, c => c.customer, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  migrate: Migrate;

  @OneToMany(() => Roles, c => c.customer,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  roles: Roles[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}