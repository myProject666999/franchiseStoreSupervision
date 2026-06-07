import { IsOptional, IsString, IsInt, IsNumber, IsDateString, MaxLength, Matches } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '门店名称长度不能超过100个字符' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '门店编码长度不能超过50个字符' })
  code?: string;

  @IsOptional()
  @IsInt({ message: '区域ID必须是整数' })
  areaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '门店地址长度不能超过255个字符' })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: '经度格式不正确' })
  longitude?: number;

  @IsOptional()
  @IsNumber({}, { message: '纬度格式不正确' })
  latitude?: number;

  @IsOptional()
  @IsInt({ message: '签到半径必须是整数' })
  checkinRadius?: number;

  @IsOptional()
  @IsInt({ message: '店长ID必须是整数' })
  managerId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '加盟商姓名长度不能超过50个字符' })
  franchiseeName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '加盟商手机号格式不正确' })
  franchiseePhone?: string;

  @IsOptional()
  @IsDateString({}, { message: '开业日期格式不正确' })
  openingDate?: string;

  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  status?: number;
}
