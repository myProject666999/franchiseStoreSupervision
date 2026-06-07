import { IsNumber, IsNotEmpty, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class InspectionItemScoreDto {
  @IsInt({ message: '检查项ID必须是整数' })
  @IsNotEmpty({ message: '检查项ID不能为空' })
  itemId: number;

  @IsInt({ message: '分类ID必须是整数' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  categoryId: number;

  @IsNumber({}, { message: '得分必须是数字' })
  @IsNotEmpty({ message: '得分不能为空' })
  @Min(0, { message: '得分不能小于0' })
  score: number;

  @IsNumber({}, { message: '最高分必须是数字' })
  @IsNotEmpty({ message: '最高分不能为空' })
  maxScore: number;

  @IsNumber({}, { message: '权重必须是数字' })
  @IsNotEmpty({ message: '权重不能为空' })
  @Min(0, { message: '权重不能小于0' })
  @Max(1, { message: '权重不能大于1' })
  weight: number;

  @IsInt({ message: '是否必须通过必须是整数' })
  @IsNotEmpty({ message: '是否必须通过不能为空' })
  mustPass: number;

  @IsOptional()
  @IsString({ message: '问题描述必须是字符串' })
  problemDescription?: string;
}
