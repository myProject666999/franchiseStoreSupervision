import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'int', unsigned: true, name: 'area_id' })
  areaId: number;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'int', name: 'checkin_radius', default: 200 })
  checkinRadius: number;

  @Column({ type: 'int', unsigned: true, name: 'manager_id', nullable: true })
  managerId: number;

  @Column({ type: 'varchar', length: 50, name: 'franchisee_name', nullable: true })
  franchiseeName: string;

  @Column({ type: 'varchar', length: 20, name: 'franchisee_phone', nullable: true })
  franchiseePhone: string;

  @Column({ type: 'date', name: 'opening_date', nullable: true })
  openingDate: Date;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
