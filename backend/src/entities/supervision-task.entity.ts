import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type TaskType = 'routine' | 'special' | 'recheck';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

@Entity('supervision_tasks')
export class SupervisionTask {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'task_no', unique: true })
  taskNo: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'int', unsigned: true, name: 'supervisor_id' })
  supervisorId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['routine', 'special', 'recheck'],
    name: 'task_type',
    default: 'routine',
  })
  taskType: TaskType;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: TaskStatus;

  @Column({ type: 'int', unsigned: true, name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
