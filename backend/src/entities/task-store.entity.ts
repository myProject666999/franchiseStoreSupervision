import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type TaskStoreCheckStatus = 'pending' | 'checked' | 'recheck_needed';

@Entity('task_stores')
export class TaskStore {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'task_id' })
  taskId: number;

  @Column({ type: 'int', unsigned: true, name: 'store_id' })
  storeId: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'checked', 'recheck_needed'],
    name: 'check_status',
    default: 'pending',
  })
  checkStatus: TaskStoreCheckStatus;

  @Column({ type: 'timestamp', name: 'checked_at', nullable: true })
  checkedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
