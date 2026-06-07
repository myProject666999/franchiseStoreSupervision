import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('check_items')
export class CheckItem {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'category_id' })
  categoryId: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', name: 'scoring_criteria' })
  scoringCriteria: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'max_score', default: 10.0 })
  maxScore: number;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ type: 'tinyint', name: 'must_pass', default: 0 })
  mustPass: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
