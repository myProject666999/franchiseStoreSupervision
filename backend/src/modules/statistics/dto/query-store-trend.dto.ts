import { IsInt, Min, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryStoreTrendDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '门店ID必须是整数' })
  @Min(1, { message: '门店ID最小为1' })
  storeId?: number;

  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;
}
