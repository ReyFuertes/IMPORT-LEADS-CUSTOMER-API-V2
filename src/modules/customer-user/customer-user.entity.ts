import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, JoinColumn, OneToMany, Unique, CreateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { Profile } from '../profile/profile.entity';
import { Accesses } from '../accesses/accesses.entity';
import { Roles } from '../roles/roles.entity';

@Entity({ synchronize: true })
@Unique(['username'])
export class CustomerUser extends BaseEntity {
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

  @OneToOne(() => Profile, c => c.customer_user,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  customer_user_profile: Profile;

  @OneToMany(() => Accesses, c => c.customer_user,
    { nullable: true, onDelete: 'CASCADE' })
  accesses: Accesses;

  @OneToMany(() => Roles, c => c.customer_user,
    { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  roles: Roles[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}