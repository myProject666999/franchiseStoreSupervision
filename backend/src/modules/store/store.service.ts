import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Store } from '../../entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { QueryStoreDto } from './dto/query-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto) {
    const existingStore = await this.storeRepository.findOne({
      where: { code: createStoreDto.code },
    });

    if (existingStore) {
      throw new ConflictException('门店编码已存在');
    }

    const store = this.storeRepository.create(createStoreDto);
    return this.storeRepository.save(store);
  }

  async findAll(queryStoreDto: QueryStoreDto) {
    const { page, pageSize, name, code, areaId, address, managerId, status } = queryStoreDto;
    const where: any = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (code) {
      where.code = Like(`%${code}%`);
    }
    if (areaId !== undefined) {
      where.areaId = areaId;
    }
    if (address) {
      where.address = Like(`%${address}%`);
    }
    if (managerId !== undefined) {
      where.managerId = managerId;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [items, total] = await this.storeRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('门店不存在');
    }
    return store;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('门店不存在');
    }

    if (updateStoreDto.code && updateStoreDto.code !== store.code) {
      const existingStore = await this.storeRepository.findOne({
        where: { code: updateStoreDto.code },
      });
      if (existingStore) {
        throw new ConflictException('门店编码已存在');
      }
    }

    await this.storeRepository.update(id, updateStoreDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('门店不存在');
    }
    await this.storeRepository.delete(id);
    return { message: '删除成功' };
  }
}
