import { IsArray, IsNotEmpty, ValidateNested, IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { InspectionItemScoreDto } from './inspection-item-score.dto';
import { InspectionPhotoDto } from './inspection-photo.dto';

export class SubmitInspectionReportDto {
  @IsArray({ message: '检查项得分列表必须是数组' })
  @IsNotEmpty({ message: '检查项得分列表不能为空' })
  @ValidateNested({ each: true })
  @Type(() => InspectionItemScoreDto)
  itemScores: InspectionItemScoreDto[];

  @IsOptional()
  @IsArray({ message: '照片列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => InspectionPhotoDto)
  photos?: InspectionPhotoDto[];

  @IsOptional()
  @IsString({ message: '总结必须是字符串' })
  summary?: string;

  @IsOptional()
  @IsString({ message: '改进建议必须是字符串' })
  improvementSuggestions?: string;

  @IsOptional()
  @IsInt({ message: '整改期限天数必须是整数' })
  defaultDeadlineDays?: number;
}
