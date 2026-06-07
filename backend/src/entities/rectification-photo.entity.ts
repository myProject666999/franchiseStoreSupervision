import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type RectificationPhotoType = 'before' | 'after';

@Entity('rectification_photos')
export class RectificationPhoto {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'rectification_id' })
  rectificationId: number;

  @Column({ type: 'varchar', length: 255, name: 'photo_url' })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: ['before', 'after'],
    name: 'photo_type',
  })
  photoType: RectificationPhotoType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
