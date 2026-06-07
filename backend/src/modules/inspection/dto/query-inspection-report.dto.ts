import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus } from '../../../entities/inspection-report.entity';

export class QueryInspectionReportDto {
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
  @IsEnum(['draft', 'submitted', 'confirmed'], { message: '状态必须是 draft、submitted 或 confirmed' })
  status?: ReportStatus;

  @IsOptional()
  @IsInt({ message: '是否通过必须是整数' })
  isPass?: number;

  @IsOptional()
  @IsString({ message: '报告编号必须是字符串' })
  reportNo?: string;

  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
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
