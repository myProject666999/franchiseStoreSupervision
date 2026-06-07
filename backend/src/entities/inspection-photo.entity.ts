import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type PhotoType = 'overall' | 'problem' | 'evidence';

@Entity('inspection_photos')
export class InspectionPhoto {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'report_id' })
  reportId: number;

  @Column({ type: 'int', unsigned: true, name: 'item_score_id', nullable: true })
  itemScoreId: number;

  @Column({ type: 'varchar', length: 255, name: 'photo_url' })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: ['overall', 'problem', 'evidence'],
    name: 'photo_type',
    default: 'evidence',
  })
  photoType: PhotoType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
