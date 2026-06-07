import { IsNotEmpty, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCheckinDto {
  @IsInt({ message: '任务ID必须是整数' })
  @IsNotEmpty({ message: '任务ID不能为空' })
  taskId: number;

  @IsInt({ message: '门店ID必须是整数' })
  @IsNotEmpty({ message: '门店ID不能为空' })
  storeId: number;

  @IsNumber({}, { message: '经度格式不正确' })
  @IsNotEmpty({ message: '经度不能为空' })
  longitude: number;

  @IsNumber({}, { message: '纬度格式不正确' })
  @IsNotEmpty({ message: '纬度不能为空' })
  latitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '照片URL长度不能超过255个字符' })
  photoUrl?: string;
}
