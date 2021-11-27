import { BaseEntity, PrimaryGeneratedColumn, Generated, Column, Entity, Unique, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Accesses } from '../accesses/accesses.entity';

@Entity({synchronize: true })
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

  @OneToMany(() => Accesses, c => c.access, { nullable: true, onDelete: 'CASCADE' })
  accesses: Accesses;
}
