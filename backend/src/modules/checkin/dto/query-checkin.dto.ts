import { IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCheckinDto {
  @IsOptional()
  @IsInt({ message: '任务ID必须是整数' })
  taskId?: number;

  @IsOptional()
  @IsInt({ message: '门店ID必须是整数' })
  storeId?: number;

  @IsOptional()
  @IsInt({ message: '督导ID必须是整数' })
  supervisorId?: number;

  @IsOptional()
  @IsInt({ message: '是否有效必须是整数' })
  isValid?: number;

  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

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
  pageSize?: number = 10;
}
