import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt({ message: '区域ID必须是整数' })
  areaId?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsInt({ message: '店长ID必须是整数' })
  managerId?: number;

  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  status?: number;

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
