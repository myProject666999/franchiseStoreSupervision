import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('checkin_records')
export class CheckinRecord {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'task_id' })
  taskId: number;

  @Column({ type: 'int', unsigned: true, name: 'store_id' })
  storeId: number;

  @Column({ type: 'int', unsigned: true, name: 'supervisor_id' })
  supervisorId: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distance: number;

  @Column({ type: 'tinyint', name: 'is_valid', default: 1 })
  isValid: number;

  @Column({ type: 'varchar', length: 255, name: 'invalid_reason', nullable: true })
  invalidReason: string;

  @Column({ type: 'timestamp', name: 'checkin_time', default: () => 'CURRENT_TIMESTAMP' })
  checkinTime: Date;

  @Column({ type: 'varchar', length: 255, name: 'photo_url', nullable: true })
  photoUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
