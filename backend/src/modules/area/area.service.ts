import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Area } from '../../entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { QueryAreaDto } from './dto/query-area.dto';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    const existingArea = await this.areaRepository.findOne({
      where: { code: createAreaDto.code },
    });

    if (existingArea) {
      throw new ConflictException('区域编码已存在');
    }

    const area = this.areaRepository.create(createAreaDto);
    return this.areaRepository.save(area);
  }

  async findAll(queryAreaDto: QueryAreaDto) {
    const { page, pageSize, name, code, parentId, level, managerId } = queryAreaDto;
    const where: any = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (code) {
      where.code = Like(`%${code}%`);
    }
    if (parentId !== undefined) {
      where.parentId = parentId;
    }
    if (level !== undefined) {
      where.level = level;
    }
    if (managerId !== undefined) {
      where.managerId = managerId;
    }

    const [items, total] = await this.areaRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });

    return {
      list: items,
      total,
      page,
      pageSize,
    };
  }

  async findTree() {
    const allAreas = await this.areaRepository.find({
      order: { level: 'ASC', id: 'ASC' },
    });

    const buildTree = (parentId: number | null) => {
      return allAreas
        .filter((area) => area.parentId === parentId)
        .map((area) => ({
          ...area,
          children: buildTree(area.id),
        }));
    };

    return buildTree(null);
  }

  async findOne(id: number) {
    const area = await this.areaRepository.findOne({ where: { id } });
    if (!area) {
      throw new NotFoundException('区域不存在');
    }
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area = await this.areaRepository.findOne({ where: { id } });
    if (!area) {
      throw new NotFoundException('区域不存在');
    }

    if (updateAreaDto.code && updateAreaDto.code !== area.code) {
      const existingArea = await this.areaRepository.findOne({
        where: { code: updateAreaDto.code },
      });
      if (existingArea) {
        throw new ConflictException('区域编码已存在');
      }
    }

    await this.areaRepository.update(id, updateAreaDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const area = await this.areaRepository.findOne({ where: { id } });
    if (!area) {
      throw new NotFoundException('区域不存在');
    }

    const hasChildren = await this.areaRepository.findOne({
      where: { parentId: id },
    });
    if (hasChildren) {
      throw new ConflictException('该区域下存在子区域，无法删除');
    }

    await this.areaRepository.delete(id);
    return { message: '删除成功' };
  }
}
