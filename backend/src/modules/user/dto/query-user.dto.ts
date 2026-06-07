import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';
import { Type } from 'class-transformer';

export class QueryUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['admin', 'supervisor', 'store_manager', 'area_manager'], { message: '角色类型不正确' })
  role?: UserRole;

  @IsOptional()
  @IsInt({ message: '区域ID必须是整数' })
  areaId?: number;

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
