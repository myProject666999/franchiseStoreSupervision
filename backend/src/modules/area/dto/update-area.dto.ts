import { IsOptional, IsString, IsInt, MaxLength } from 'class-validator';

export class UpdateAreaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '区域名称长度不能超过100个字符' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '区域编码长度不能超过50个字符' })
  code?: string;

  @IsOptional()
  @IsInt({ message: '父级区域ID必须是整数' })
  parentId?: number;

  @IsOptional()
  @IsInt({ message: '层级必须是整数' })
  level?: number;

  @IsOptional()
  @IsInt({ message: '区域经理ID必须是整数' })
  managerId?: number;
}
