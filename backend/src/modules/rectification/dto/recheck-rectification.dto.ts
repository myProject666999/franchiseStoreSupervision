import { IsEnum, IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';
import { RecheckResult } from '../../../entities/rectification-order.entity';

export class RecheckRectificationDto {
  @IsEnum(['pass', 'fail'], { message: '复检结果必须是 pass 或 fail' })
  @IsNotEmpty({ message: '复检结果不能为空' })
  recheckResult: RecheckResult;

  @IsOptional()
  @IsInt({ message: '复检报告ID必须是整数' })
  recheckReportId?: number;

  @IsOptional()
  @IsString({ message: '复检备注必须是字符串' })
  remark?: string;
}
