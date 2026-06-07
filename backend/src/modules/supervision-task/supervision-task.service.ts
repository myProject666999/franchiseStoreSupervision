import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { SupervisionTask, TaskStatus } from '../../entities/supervision-task.entity';
import { TaskStore } from '../../entities/task-store.entity';
import { CreateSupervisionTaskDto } from './dto/create-supervision-task.dto';
import { UpdateSupervisionTaskDto } from './dto/update-supervision-task.dto';
import { QuerySupervisionTaskDto } from './dto/query-supervision-task.dto';
import { AssignStoresDto } from './dto/assign-stores.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Injectable()
export class SupervisionTaskService {
  constructor(
    @InjectRepository(SupervisionTask)
    private taskRepository: Repository<SupervisionTask>,
    @InjectRepository(TaskStore)
    private taskStoreRepository: Repository<TaskStore>,
  ) {}

  private async generateTaskNo(): Promise<string> {
    const date = new Date();
    const prefix = `ST${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    const lastTask = await this.taskRepository.findOne({
      where: { taskNo: Like(`${prefix}%`) },
      order: { taskNo: 'DESC' },
    });

    let sequence = 1;
    if (lastTask) {
      const lastSequence = parseInt(lastTask.taskNo.slice(-4), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  async create(createSupervisionTaskDto: CreateSupervisionTaskDto, userId: number) {
    const taskNo = await this.generateTaskNo();
    
    const task = this.taskRepository.create({
      ...createSupervisionTaskDto,
      taskNo,
      createdBy: userId,
      startDate: new Date(createSupervisionTaskDto.startDate),
      endDate: new Date(createSupervisionTaskDto.endDate),
    });

    const savedTask = await this.taskRepository.save(task);

    const taskStores = createSupervisionTaskDto.storeIds.map(storeId =>
      this.taskStoreRepository.create({
        taskId: savedTask.id,
        storeId,
      })
    );

    await this.taskStoreRepository.save(taskStores);

    return this.findOne(savedTask.id);
  }

  async findAll(querySupervisionTaskDto: QuerySupervisionTaskDto) {
    const { page, pageSize, name, taskNo, supervisorId, taskType, status, startDate, endDate } = querySupervisionTaskDto;
    const where: any = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (taskNo) {
      where.taskNo = Like(`%${taskNo}%`);
    }
    if (supervisorId !== undefined) {
      where.supervisorId = supervisorId;
    }
    if (taskType) {
      where.taskType = taskType;
    }
    if (status) {
      where.status = status;
    }
    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    }

    const [items, total] = await this.taskRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findMyTasks(supervisorId: number, querySupervisionTaskDto: QuerySupervisionTaskDto) {
    const { page, pageSize, name, taskNo, taskType, status, startDate, endDate } = querySupervisionTaskDto;
    const where: any = { supervisorId };

    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (taskNo) {
      where.taskNo = Like(`%${taskNo}%`);
    }
    if (taskType) {
      where.taskType = taskType;
    }
    if (status) {
      where.status = status;
    }
    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    }

    const [items, total] = await this.taskRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('督导任务不存在');
    }

    const taskStores = await this.taskStoreRepository.find({
      where: { taskId: id },
    });

    return {
      ...task,
      stores: taskStores,
    };
  }

  async update(id: number, updateSupervisionTaskDto: UpdateSupervisionTaskDto) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('督导任务不存在');
    }

    const updateData: any = { ...updateSupervisionTaskDto };
    if (updateSupervisionTaskDto.startDate) {
      updateData.startDate = new Date(updateSupervisionTaskDto.startDate);
    }
    if (updateSupervisionTaskDto.endDate) {
      updateData.endDate = new Date(updateSupervisionTaskDto.endDate);
    }

    await this.taskRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('督导任务不存在');
    }

    await this.taskStoreRepository.delete({ taskId: id });
    await this.taskRepository.delete(id);
    return { message: '删除成功' };
  }

  async assignStores(id: number, assignStoresDto: AssignStoresDto) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('督导任务不存在');
    }

    await this.taskStoreRepository.delete({ taskId: id });

    const taskStores = assignStoresDto.storeIds.map(storeId =>
      this.taskStoreRepository.create({
        taskId: id,
        storeId,
      })
    );

    await this.taskStoreRepository.save(taskStores);

    return this.findOne(id);
  }

  async changeStatus(id: number, changeStatusDto: ChangeStatusDto) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('督导任务不存在');
    }

    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      pending: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[task.status].includes(changeStatusDto.status)) {
      throw new BadRequestException(`无法从 ${task.status} 状态变更为 ${changeStatusDto.status} 状态`);
    }

    await this.taskRepository.update(id, { status: changeStatusDto.status });
    return this.findOne(id);
  }
}
