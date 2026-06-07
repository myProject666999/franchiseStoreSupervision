import { IsString, IsOptional, IsInt, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { TaskType, TaskStatus } from '../../../entities/supervision-task.entity';

export class UpdateSupervisionTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '任务名称长度不能超过200个字符' })
  name?: string;

  @IsOptional()
  @IsInt({ message: '督导ID必须是整数' })
  supervisorId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['routine', 'special', 'recheck'], { message: '任务类型必须是 routine、special 或 recheck' })
  taskType?: TaskType;

  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'], { message: '状态值不正确' })
  status?: TaskStatus;
}
