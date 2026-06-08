import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CheckCategory } from '../../entities/check-category.entity';
import { CreateCategoryDto } from './dto/category/create-category.dto';
import { UpdateCategoryDto } from './dto/category/update-category.dto';
import { QueryCategoryDto } from './dto/category/query-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CheckCategory)
    private categoryRepository: Repository<CheckCategory>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOne({
      where: { code: createCategoryDto.code },
    });

    if (existingCategory) {
      throw new ConflictException('分类编码已存在');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(queryCategoryDto: QueryCategoryDto) {
    const { page, pageSize, name, code } = queryCategoryDto;
    const where: any = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (code) {
      where.code = Like(`%${code}%`);
    }

    const [items, total] = await this.categoryRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { sortOrder: 'ASC', id: 'DESC' },
    });

    return {
      list: items,
      total,
      page,
      pageSize,
    };
  }

  async findAllWithItems() {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: 'ASC', id: 'DESC' },
    });
    return categories;
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('检查分类不存在');
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('检查分类不存在');
    }

    if (updateCategoryDto.code && updateCategoryDto.code !== category.code) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { code: updateCategoryDto.code },
      });
      if (existingCategory) {
        throw new ConflictException('分类编码已存在');
      }
    }

    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('检查分类不存在');
    }
    await this.categoryRepository.delete(id);
    return { message: '删除成功' };
  }
}
