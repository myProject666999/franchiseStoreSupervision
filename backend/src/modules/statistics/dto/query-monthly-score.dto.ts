import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMonthlyScoreDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '年份必须是整数' })
  @Min(2000, { message: '年份不能小于2000' })
  @Max(2100, { message: '年份不能大于2100' })
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '月份必须是整数' })
  @Min(1, { message: '月份最小为1' })
  @Max(12, { message: '月份最大为12' })
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '区域ID必须是整数' })
  areaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '门店ID必须是整数' })
  storeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数最小为1' })
  @Max(100, { message: '每页条数最大为100' })
  pageSize?: number = 20;
}
