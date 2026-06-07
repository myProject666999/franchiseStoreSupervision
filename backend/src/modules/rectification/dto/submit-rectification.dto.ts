import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RectificationPhotoDto {
  @IsString({ message: '照片URL必须是字符串' })
  @IsNotEmpty({ message: '照片URL不能为空' })
  photoUrl: string;

  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description?: string;
}

export class SubmitRectificationDto {
  @IsString({ message: '整改描述必须是字符串' })
  @IsNotEmpty({ message: '整改描述不能为空' })
  rectificationDescription: string;

  @IsArray({ message: '整改后照片列表必须是数组' })
  @IsNotEmpty({ message: '整改后照片列表不能为空' })
  @ValidateNested({ each: true })
  @Type(() => RectificationPhotoDto)
  afterPhotos: RectificationPhotoDto[];
}
