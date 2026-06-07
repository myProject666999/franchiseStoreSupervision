import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsEnum, IsDateString, MaxLength, ArrayMinSize } from 'class-validator';
import { TaskType } from '../../../entities/supervision-task.entity';

export class CreateSupervisionTaskDto {
  @IsString()
  @IsNotEmpty({ message: '任务名称不能为空' })
  @MaxLength(200, { message: '任务名称长度不能超过200个字符' })
  name: string;

  @IsInt({ message: '督导ID必须是整数' })
  @IsNotEmpty({ message: '督导ID不能为空' })
  supervisorId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['routine', 'special', 'recheck'], { message: '任务类型必须是 routine、special 或 recheck' })
  @IsNotEmpty({ message: '任务类型不能为空' })
  taskType: TaskType;

  @IsDateString({}, { message: '开始日期格式不正确' })
  @IsNotEmpty({ message: '开始日期不能为空' })
  startDate: string;

  @IsDateString({}, { message: '结束日期格式不正确' })
  @IsNotEmpty({ message: '结束日期不能为空' })
  endDate: string;

  @IsArray({ message: '门店ID必须是数组' })
  @ArrayMinSize(1, { message: '至少选择一个门店' })
  @IsInt({ each: true, message: '门店ID必须是整数' })
  storeIds: number[];
}
