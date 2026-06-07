import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateRectificationDto {
  @IsInt({ message: '报告ID必须是整数' })
  @IsNotEmpty({ message: '报告ID不能为空' })
  reportId: number;

  @IsInt({ message: '门店ID必须是整数' })
  @IsNotEmpty({ message: '门店ID不能为空' })
  storeId: number;

  @IsInt({ message: '检查项得分ID必须是整数' })
  @IsNotEmpty({ message: '检查项得分ID不能为空' })
  itemScoreId: number;

  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString({ message: '问题描述必须是字符串' })
  @IsNotEmpty({ message: '问题描述不能为空' })
  problemDescription: string;

  @IsString({ message: '整改要求必须是字符串' })
  @IsNotEmpty({ message: '整改要求不能为空' })
  rectificationRequirements: string;

  @IsInt({ message: '整改期限天数必须是整数' })
  @IsNotEmpty({ message: '整改期限天数不能为空' })
  deadlineDays: number;

  @IsDateString({}, { message: '整改截止日期必须是有效的日期字符串' })
  @IsNotEmpty({ message: '整改截止日期不能为空' })
  deadline: string;

  @IsInt({ message: '创建人ID必须是整数' })
  @IsNotEmpty({ message: '创建人ID不能为空' })
  createdBy: number;
}
