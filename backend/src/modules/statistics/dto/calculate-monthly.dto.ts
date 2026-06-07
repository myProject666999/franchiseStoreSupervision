import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateMonthlyDto {
  @Type(() => Number)
  @IsInt({ message: '年份必须是整数' })
  @Min(2000, { message: '年份不能小于2000' })
  @Max(2100, { message: '年份不能大于2100' })
  year: number;

  @Type(() => Number)
  @IsInt({ message: '月份必须是整数' })
  @Min(1, { message: '月份最小为1' })
  @Max(12, { message: '月份最大为12' })
  month: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '区域ID必须是整数' })
  areaId?: number;
}
