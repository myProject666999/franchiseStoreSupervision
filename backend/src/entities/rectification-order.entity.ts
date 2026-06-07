import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type RectificationStatus = 'pending' | 'rectified' | 'rechecked' | 'overdue';
export type RecheckResult = 'pass' | 'fail';

@Entity('rectification_orders')
export class RectificationOrder {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'order_no', unique: true })
  orderNo: string;

  @Column({ type: 'int', unsigned: true, name: 'report_id' })
  reportId: number;

  @Column({ type: 'int', unsigned: true, name: 'store_id' })
  storeId: number;

  @Column({ type: 'int', unsigned: true, name: 'item_score_id' })
  itemScoreId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', name: 'problem_description' })
  problemDescription: string;

  @Column({ type: 'text', name: 'rectification_requirements' })
  rectificationRequirements: string;

  @Column({ type: 'int', name: 'deadline_days', default: 7 })
  deadlineDays: number;

  @Column({ type: 'date' })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'rectified', 'rechecked', 'overdue'],
    default: 'pending',
  })
  status: RectificationStatus;

  @Column({ type: 'text', name: 'rectification_description', nullable: true })
  rectificationDescription: string;

  @Column({ type: 'timestamp', name: 'rectified_at', nullable: true })
  rectifiedAt: Date;

  @Column({ type: 'int', unsigned: true, name: 'rectified_by', nullable: true })
  rectifiedBy: number;

  @Column({ type: 'int', unsigned: true, name: 'recheck_report_id', nullable: true })
  recheckReportId: number;

  @Column({
    type: 'enum',
    enum: ['pass', 'fail'],
    name: 'recheck_result',
    nullable: true,
  })
  recheckResult: RecheckResult;

  @Column({ type: 'timestamp', name: 'rechecked_at', nullable: true })
  recheckedAt: Date;

  @Column({ type: 'int', unsigned: true, name: 'rechecked_by', nullable: true })
  recheckedBy: number;

  @Column({ type: 'int', unsigned: true, name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
