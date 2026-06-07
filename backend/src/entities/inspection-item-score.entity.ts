import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('inspection_item_scores')
export class InspectionItemScore {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'report_id' })
  reportId: number;

  @Column({ type: 'int', unsigned: true, name: 'item_id' })
  itemId: number;

  @Column({ type: 'int', unsigned: true, name: 'category_id' })
  categoryId: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'max_score' })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'weighted_score' })
  weightedScore: number;

  @Column({ type: 'tinyint', name: 'is_pass', default: 1 })
  isPass: number;

  @Column({ type: 'tinyint', name: 'must_pass', default: 0 })
  mustPass: number;

  @Column({ type: 'text', name: 'problem_description', nullable: true })
  problemDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
