import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(queryUserDto: QueryUserDto) {
    const { page, pageSize, username, realName, phone, role, areaId, status } = queryUserDto;
    const where: any = {};

    if (username) {
      where.username = Like(`%${username}%`);
    }
    if (realName) {
      where.realName = Like(`%${realName}%`);
    }
    if (phone) {
      where.phone = Like(`%${phone}%`);
    }
    if (role) {
      where.role = role;
    }
    if (areaId !== undefined) {
      where.areaId = areaId;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [items, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });

    const itemsWithoutPassword = items.map(({ password, ...rest }) => rest);

    return {
      list: itemsWithoutPassword,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const { password, ...rest } = user;
    return rest;
  }

  async findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    const updateData: any = { ...updateUserDto };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    await this.userRepository.delete(id);
    return { message: '删除成功' };
  }
}
