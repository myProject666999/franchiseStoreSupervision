import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateInspectionReportDto {
  @IsInt({ message: '任务ID必须是整数' })
  @IsNotEmpty({ message: '任务ID不能为空' })
  taskId: number;

  @IsInt({ message: '门店ID必须是整数' })
  @IsNotEmpty({ message: '门店ID不能为空' })
  storeId: number;

  @IsInt({ message: '督导ID必须是整数' })
  @IsNotEmpty({ message: '督导ID不能为空' })
  supervisorId: number;

  @IsInt({ message: '签到ID必须是整数' })
  @IsNotEmpty({ message: '签到ID不能为空' })
  checkinId: number;

  @IsDateString({}, { message: '检查日期必须是有效的日期字符串' })
  @IsNotEmpty({ message: '检查日期不能为空' })
  inspectionDate: string;

  @IsOptional()
  @IsString({ message: '总结必须是字符串' })
  summary?: string;

  @IsOptional()
  @IsString({ message: '改进建议必须是字符串' })
  improvementSuggestions?: string;
}
