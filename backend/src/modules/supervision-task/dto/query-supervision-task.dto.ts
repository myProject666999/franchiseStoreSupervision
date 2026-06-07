import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskType } from '../../../entities/supervision-task.entity';

export class QuerySupervisionTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  taskNo?: string;

  @IsOptional()
  @IsInt({ message: '督导ID必须是整数' })
  supervisorId?: number;

  @IsOptional()
  @IsEnum(['routine', 'special', 'recheck'], { message: '任务类型值不正确' })
  taskType?: TaskType;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'], { message: '状态值不正确' })
  status?: TaskStatus;

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
