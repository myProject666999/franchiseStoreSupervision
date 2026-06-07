import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { PhotoType } from '../../../entities/inspection-photo.entity';

export class InspectionPhotoDto {
  @IsString({ message: '照片URL必须是字符串' })
  @IsNotEmpty({ message: '照片URL不能为空' })
  photoUrl: string;

  @IsEnum(['overall', 'problem', 'evidence'], { message: '照片类型必须是 overall、problem 或 evidence' })
  @IsNotEmpty({ message: '照片类型不能为空' })
  photoType: PhotoType;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  sortOrder?: number;

  @IsOptional()
  @IsInt({ message: '项得分ID必须是整数' })
  itemScoreId?: number;
}
