import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CheckItem } from '../../entities/check-item.entity';
import { CheckCategory } from '../../entities/check-category.entity';
import { CreateItemDto } from './dto/item/create-item.dto';
import { UpdateItemDto } from './dto/item/update-item.dto';
import { QueryItemDto } from './dto/item/query-item.dto';

@Injectable()
export class CheckItemService {
  constructor(
    @InjectRepository(CheckItem)
    private checkItemRepository: Repository<CheckItem>,
    @InjectRepository(CheckCategory)
    private categoryRepository: Repository<CheckCategory>,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: createItemDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('检查分类不存在');
    }

    const item = this.checkItemRepository.create(createItemDto);
    return this.checkItemRepository.save(item);
  }

  async findAll(queryItemDto: QueryItemDto) {
    const { page, pageSize, categoryId, name, status } = queryItemDto;
    const where: any = {};

    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [items, total] = await this.checkItemRepository.findAndCount({
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

  async findTree() {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: 'ASC', id: 'DESC' },
    });

    const items = await this.checkItemRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC', id: 'DESC' },
    });

    return categories.map((category) => ({
      ...category,
      items: items.filter((item) => item.categoryId === category.id),
    }));
  }

  async findOne(id: number) {
    const item = await this.checkItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('检查项不存在');
    }
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const item = await this.checkItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('检查项不存在');
    }

    if (updateItemDto.categoryId && updateItemDto.categoryId !== item.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateItemDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('检查分类不存在');
      }
    }

    await this.checkItemRepository.update(id, updateItemDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const item = await this.checkItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('检查项不存在');
    }
    await this.checkItemRepository.delete(id);
    return { message: '删除成功' };
  }
}
