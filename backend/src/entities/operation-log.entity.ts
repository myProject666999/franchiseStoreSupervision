import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 50, name: 'user_name' })
  userName: string;

  @Column({ type: 'varchar', length: 50 })
  module: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'int', unsigned: true, name: 'target_id', nullable: true })
  targetId: number;

  @Column({ type: 'varchar', length: 255, name: 'target_name', nullable: true })
  targetName: string;

  @Column({ type: 'varchar', length: 50, name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
