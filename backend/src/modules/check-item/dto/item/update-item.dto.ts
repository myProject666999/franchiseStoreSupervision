import { IsOptional, IsString, IsInt, IsNumber, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '分类ID必须是整数' })
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '检查项名称长度不能超过200个字符' })
  name?: string;

  @IsOptional()
  @IsString()
  scoringCriteria?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '权重格式不正确' })
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最高分格式不正确' })
  maxScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '排序必须是整数' })
  sortOrder?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '是否必过必须是整数' })
  mustPass?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '状态必须是整数' })
  status?: number;
}
