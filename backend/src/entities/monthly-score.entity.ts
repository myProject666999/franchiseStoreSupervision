import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('monthly_scores')
export class MonthlyScore {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'store_id' })
  storeId: number;

  @Column({ type: 'int', unsigned: true, name: 'area_id' })
  areaId: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'tinyint' })
  month: number;

  @Column({ type: 'int', name: 'inspection_count', default: 0 })
  inspectionCount: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'avg_score', default: 0 })
  avgScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'avg_score_rate', default: 0 })
  avgScoreRate: number;

  @Column({ type: 'int', name: 'pass_count', default: 0 })
  passCount: number;

  @Column({ type: 'int', name: 'fail_count', default: 0 })
  failCount: number;

  @Column({ type: 'int', name: 'problem_count', default: 0 })
  problemCount: number;

  @Column({ type: 'int', name: 'rectification_count', default: 0 })
  rectificationCount: number;

  @Column({ type: 'int', name: 'rank_in_area', nullable: true })
  rankInArea: number;

  @Column({ type: 'int', name: 'rank_city', nullable: true })
  rankCity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
