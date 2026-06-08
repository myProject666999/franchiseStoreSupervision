import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @Type(() => Number)
  @IsInt({ message: '分类ID必须是整数' })
  categoryId: number;

  @IsString()
  @IsNotEmpty({ message: '检查项名称不能为空' })
  @MaxLength(200, { message: '检查项名称长度不能超过200个字符' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '评分标准不能为空' })
  scoringCriteria: string;

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
