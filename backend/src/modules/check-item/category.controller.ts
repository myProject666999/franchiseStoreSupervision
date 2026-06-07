import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/category/create-category.dto';
import { UpdateCategoryDto } from './dto/category/update-category.dto';
import { QueryCategoryDto } from './dto/category/query-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('check-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles('admin')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findAll(@Query() queryCategoryDto: QueryCategoryDto) {
    return this.categoryService.findAll(queryCategoryDto);
  }

  @Get('all')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findAllWithItems() {
    return this.categoryService.findAllWithItems();
  }

  @Get(':id')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
