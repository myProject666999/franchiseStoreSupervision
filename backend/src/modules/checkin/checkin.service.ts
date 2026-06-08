import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { Store } from '../../entities/store.entity';
import { SupervisionTask } from '../../entities/supervision-task.entity';
import { TaskStore } from '../../entities/task-store.entity';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { QueryCheckinDto } from './dto/query-checkin.dto';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(CheckinRecord)
    private checkinRepository: Repository<CheckinRecord>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(SupervisionTask)
    private taskRepository: Repository<SupervisionTask>,
    @InjectRepository(TaskStore)
    private taskStoreRepository: Repository<TaskStore>,
  ) {}

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async create(createCheckinDto: CreateCheckinDto, supervisorId: number) {
    const task = await this.taskRepository.findOne({
      where: { id: createCheckinDto.taskId },
    });
    if (!task) {
      throw new NotFoundException('督导任务不存在');
    }

    if (task.supervisorId !== supervisorId) {
      throw new BadRequestException('您不是该任务的督导，无法签到');
    }

    if (task.status !== 'in_progress') {
      throw new BadRequestException('任务未开始或已结束，无法签到');
    }

    const taskStore = await this.taskStoreRepository.findOne({
      where: { taskId: createCheckinDto.taskId, storeId: createCheckinDto.storeId },
    });
    if (!taskStore) {
      throw new BadRequestException('该门店不在此任务的督导范围内');
    }

    const store = await this.storeRepository.findOne({
      where: { id: createCheckinDto.storeId },
    });
    if (!store) {
      throw new NotFoundException('门店不存在');
    }

    const distance = this.calculateDistance(
      createCheckinDto.latitude,
      createCheckinDto.longitude,
      store.latitude,
      store.longitude,
    );

    let isValid = 1;
    let invalidReason = '';

    if (distance > store.checkinRadius) {
      isValid = 0;
      invalidReason = `超出签到范围，距离门店 ${distance.toFixed(2)} 米，允许范围 ${store.checkinRadius} 米`;
    }

    const checkinRecord = this.checkinRepository.create({
      ...createCheckinDto,
      supervisorId,
      distance: Number(distance.toFixed(2)),
      isValid,
      invalidReason,
    });

    const savedRecord = await this.checkinRepository.save(checkinRecord);

    if (isValid) {
      await this.taskStoreRepository.update(taskStore.id, {
        checkStatus: 'checked',
        checkedAt: new Date(),
      });
    }

    return {
      ...savedRecord,
      distance: Number(savedRecord.distance),
    };
  }

  async findAll(queryCheckinDto: QueryCheckinDto) {
    const { page, pageSize, taskId, storeId, supervisorId, isValid, startDate, endDate } = queryCheckinDto;
    const where: any = {};

    if (taskId !== undefined) {
      where.taskId = taskId;
    }
    if (storeId !== undefined) {
      where.storeId = storeId;
    }
    if (supervisorId !== undefined) {
      where.supervisorId = supervisorId;
    }
    if (isValid !== undefined) {
      where.isValid = isValid;
    }
    if (startDate && endDate) {
      where.checkinTime = Between(new Date(startDate), new Date(endDate));
    }

    const [items, total] = await this.checkinRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { checkinTime: 'DESC' },
    });

    const formattedItems = items.map(item => ({
      ...item,
      distance: Number(item.distance),
    }));

    return {
      list: formattedItems,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const record = await this.checkinRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('签到记录不存在');
    }
    return {
      ...record,
      distance: Number(record.distance),
    };
  }
}
