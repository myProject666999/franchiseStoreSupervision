import { IsOptional, IsString, IsEnum, IsInt, MinLength, MaxLength, Matches } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '用户名长度不能少于3个字符' })
  @MaxLength(50, { message: '用户名长度不能超过50个字符' })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '真实姓名长度不能超过50个字符' })
  realName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @IsOptional()
  @IsEnum(['admin', 'supervisor', 'store_manager', 'area_manager'], { message: '角色类型不正确' })
  role?: UserRole;

  @IsOptional()
  @IsInt({ message: '区域ID必须是整数' })
  areaId?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  status?: number;
}
