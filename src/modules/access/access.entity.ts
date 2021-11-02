import { BaseEntity, PrimaryGeneratedColumn, Generated, Column, Entity, Unique, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { CustomerAccess } from '../customer-access/customer-access.entity';

@Entity({ synchronize: false })
@Unique(['access_name'])
export class Access extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column({ nullable: true })
  access_name: string;

  @Column({ nullable: true })
  customer_route: string;

  @ManyToOne(() => Access, p => p.id, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Access;

  @PrimaryGeneratedColumn('increment')
  @Column({ nullable: true })
  position: number;

  @OneToMany(() => CustomerAccess, c => c.customer, { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  customer_access: CustomerAccess;
}
