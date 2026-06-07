import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CheckItemService } from './check-item.service';
import { CreateItemDto } from './dto/item/create-item.dto';
import { UpdateItemDto } from './dto/item/update-item.dto';
import { QueryItemDto } from './dto/item/query-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('check-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckItemController {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Post()
  @Roles('admin')
  create(@Body() createItemDto: CreateItemDto) {
    return this.checkItemService.create(createItemDto);
  }

  @Get()
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findAll(@Query() queryItemDto: QueryItemDto) {
    return this.checkItemService.findAll(queryItemDto);
  }

  @Get('tree')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findTree() {
    return this.checkItemService.findTree();
  }

  @Get(':id')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findOne(@Param('id') id: string) {
    return this.checkItemService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.checkItemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.checkItemService.remove(+id);
  }
}
