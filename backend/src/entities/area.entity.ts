import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'int', unsigned: true, name: 'parent_id', nullable: true })
  parentId: number;

  @Column({ type: 'tinyint', default: 1 })
  level: number;

  @Column({ type: 'int', unsigned: true, name: 'manager_id', nullable: true })
  managerId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
