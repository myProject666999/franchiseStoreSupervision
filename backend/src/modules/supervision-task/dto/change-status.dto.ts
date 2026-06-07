import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../../../entities/supervision-task.entity';

export class ChangeStatusDto {
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'], { message: '状态值不正确' })
  @IsNotEmpty({ message: '状态不能为空' })
  status: TaskStatus;
}
