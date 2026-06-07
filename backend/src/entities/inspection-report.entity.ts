import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ReportStatus = 'draft' | 'submitted' | 'confirmed';

@Entity('inspection_reports')
export class InspectionReport {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'report_no', unique: true })
  reportNo: string;

  @Column({ type: 'int', unsigned: true, name: 'task_id' })
  taskId: number;

  @Column({ type: 'int', unsigned: true, name: 'store_id' })
  storeId: number;

  @Column({ type: 'int', unsigned: true, name: 'supervisor_id' })
  supervisorId: number;

  @Column({ type: 'int', unsigned: true, name: 'checkin_id' })
  checkinId: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'total_score' })
  totalScore: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'max_score' })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'score_rate' })
  scoreRate: number;

  @Column({ type: 'tinyint', name: 'is_pass', default: 1 })
  isPass: number;

  @Column({ type: 'int', name: 'problem_count', default: 0 })
  problemCount: number;

  @Column({ type: 'tinyint', name: 'must_pass_failed', default: 0 })
  mustPassFailed: number;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', name: 'improvement_suggestions', nullable: true })
  improvementSuggestions: string;

  @Column({ type: 'date', name: 'inspection_date' })
  inspectionDate: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'confirmed'],
    default: 'draft',
  })
  status: ReportStatus;

  @Column({ type: 'timestamp', name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ type: 'int', unsigned: true, name: 'confirmed_by', nullable: true })
  confirmedBy: number;

  @Column({ type: 'timestamp', name: 'confirmed_at', nullable: true })
  confirmedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
