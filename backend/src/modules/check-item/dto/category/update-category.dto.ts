import { IsOptional, IsString, IsInt, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '分类名称长度不能超过50个字符' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '分类编码长度不能超过50个字符' })
  code?: string;

  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '描述长度不能超过255个字符' })
  description?: string;
}
