import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class AssignStoresDto {
  @IsArray({ message: '门店ID必须是数组' })
  @ArrayMinSize(1, { message: '至少选择一个门店' })
  @IsInt({ each: true, message: '门店ID必须是整数' })
  storeIds: number[];
}
