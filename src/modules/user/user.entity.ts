import { BaseEntity, PrimaryGeneratedColumn, Generated, ManyToOne, OneToOne, Column, Entity, JoinColumn, OneToMany, Unique, CreateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt'

@Entity({ synchronize: true })
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: false, default: false })
  is_master_admin: boolean;

  @Column({ nullable: false, default: 0 })
  is_change_password: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}