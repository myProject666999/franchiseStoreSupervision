import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { QueryAreaDto } from './dto/query-area.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @Roles('admin')
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @Get()
  @Roles('admin', 'area_manager', 'supervisor')
  findAll(@Query() queryAreaDto: QueryAreaDto) {
    return this.areaService.findAll(queryAreaDto);
  }

  @Get('tree')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findTree() {
    return this.areaService.findTree();
  }

  @Get(':id')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findOne(@Param('id') id: string) {
    return this.areaService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(+id, updateAreaDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.areaService.remove(+id);
  }
}
