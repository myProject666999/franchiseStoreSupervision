import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RectificationStatus } from '../../../entities/rectification-order.entity';

export class QueryRectificationDto {
  @IsOptional()
  @IsInt({ message: '报告ID必须是整数' })
  reportId?: number;

  @IsOptional()
  @IsInt({ message: '门店ID必须是整数' })
  storeId?: number;

  @IsOptional()
  @IsEnum(['pending', 'rectified', 'rechecked', 'overdue'], { message: '状态必须是 pending、rectified、rechecked 或 overdue' })
  status?: RectificationStatus;

  @IsOptional()
  @IsEnum(['pass', 'fail'], { message: '复检结果必须是 pass 或 fail' })
  recheckResult?: string;

  @IsOptional()
  @IsString({ message: '整改单编号必须是字符串' })
  orderNo?: string;

  @IsOptional()
  @IsInt({ message: '整改人ID必须是整数' })
  rectifiedBy?: number;

  @IsOptional()
  @IsInt({ message: '创建人ID必须是整数' })
  createdBy?: number;

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
