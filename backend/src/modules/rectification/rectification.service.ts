import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { RectificationOrder } from '../../entities/rectification-order.entity';
import { RectificationPhoto } from '../../entities/rectification-photo.entity';
import { InspectionReport } from '../../entities/inspection-report.entity';
import { InspectionItemScore } from '../../entities/inspection-item-score.entity';
import { InspectionPhoto } from '../../entities/inspection-photo.entity';
import { CheckItem } from '../../entities/check-item.entity';
import { SubmitRectificationDto } from './dto/submit-rectification.dto';
import { RecheckRectificationDto } from './dto/recheck-rectification.dto';
import { QueryRectificationDto } from './dto/query-rectification.dto';

@Injectable()
export class RectificationService {
  constructor(
    @InjectRepository(RectificationOrder)
    private orderRepository: Repository<RectificationOrder>,
    @InjectRepository(RectificationPhoto)
    private photoRepository: Repository<RectificationPhoto>,
    @InjectRepository(InspectionItemScore)
    private itemScoreRepository: Repository<InspectionItemScore>,
    @InjectRepository(InspectionPhoto)
    private inspectionPhotoRepository: Repository<InspectionPhoto>,
    @InjectRepository(CheckItem)
    private checkItemRepository: Repository<CheckItem>,
  ) {}

  private async generateOrderNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `RECT${dateStr}`;
    
    const lastOrder = await this.orderRepository.findOne({
      where: { orderNo: Like(`${prefix}%`) },
      order: { orderNo: 'DESC' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNo.slice(prefix.length), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async createFromInspectionReport(
    report: InspectionReport,
    failedItems: InspectionItemScore[],
    createdBy: number,
    defaultDeadlineDays: number = 7,
  ) {
    const itemIds = failedItems.map(item => item.itemId);
    const checkItems = await this.checkItemRepository.findByIds(itemIds);
    const checkItemMap = new Map(checkItems.map(item => [item.id, item]));

    const itemScoreIds = failedItems.map(item => item.id);
    const inspectionPhotos = await this.inspectionPhotoRepository.find({
      where: { reportId: report.id },
    });
    const photoMap = new Map<number, InspectionPhoto[]>();
    for (const photo of inspectionPhotos) {
      if (photo.itemScoreId) {
        if (!photoMap.has(photo.itemScoreId)) {
          photoMap.set(photo.itemScoreId, []);
        }
        photoMap.get(photo.itemScoreId)!.push(photo);
      }
    }

    for (const itemScore of failedItems) {
      const checkItem = checkItemMap.get(itemScore.itemId);
      if (!checkItem) continue;

      const orderNo = await this.generateOrderNo();
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + defaultDeadlineDays);

      const order = this.orderRepository.create({
        orderNo,
        reportId: report.id,
        storeId: report.storeId,
        itemScoreId: itemScore.id,
        title: `整改：${checkItem.name}`,
        problemDescription: itemScore.problemDescription || `检查项"${checkItem.name}"未通过`,
        rectificationRequirements: `请针对"${checkItem.name}"检查项存在的问题进行整改，整改要求参考评分标准：${checkItem.scoringCriteria}`,
        deadlineDays: defaultDeadlineDays,
        deadline,
        status: 'pending' as const,
        createdBy,
      });

      const savedOrder = await this.orderRepository.save(order);

      const itemPhotos = photoMap.get(itemScore.id) || [];
      for (const photo of itemPhotos) {
        const rectPhoto = this.photoRepository.create({
          rectificationId: savedOrder.id,
          photoUrl: photo.photoUrl,
          photoType: 'before' as const,
          description: photo.description || '问题照片',
        });
        await this.photoRepository.save(rectPhoto);
      }
    }
  }

  async findAll(queryDto: QueryRectificationDto) {
    const { page, pageSize, reportId, storeId, status, recheckResult, orderNo, rectifiedBy, createdBy } = queryDto;
    const where: any = {};

    if (reportId !== undefined) where.reportId = reportId;
    if (storeId !== undefined) where.storeId = storeId;
    if (status) where.status = status;
    if (recheckResult) where.recheckResult = recheckResult;
    if (orderNo) where.orderNo = Like(`%${orderNo}%`);
    if (rectifiedBy !== undefined) where.rectifiedBy = rectifiedBy;
    if (createdBy !== undefined) where.createdBy = createdBy;

    const [items, total] = await this.orderRepository.findAndCount({
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

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('整改单不存在');
    }

    const photos = await this.photoRepository.find({
      where: { rectificationId: id },
      order: { id: 'ASC' },
    });

    const itemScore = await this.itemScoreRepository.findOne({
      where: { id: order.itemScoreId },
    });

    return {
      ...order,
      photos,
      itemScore,
    };
  }

  async submitRectification(id: number, submitDto: SubmitRectificationDto, userId: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('整改单不存在');
    }
    if (order.status !== 'pending' && order.status !== 'overdue') {
      throw new BadRequestException('只能提交待整改或已逾期状态的整改单');
    }

    const now = new Date();
    const isOverdue = now > order.deadline;

    await this.orderRepository.update(id, {
      rectificationDescription: submitDto.rectificationDescription,
      rectifiedAt: now,
      rectifiedBy: userId,
      status: isOverdue ? 'rectified' as const : 'rectified' as const,
    });

    for (const photoDto of submitDto.afterPhotos) {
      const photo = this.photoRepository.create({
        rectificationId: id,
        photoUrl: photoDto.photoUrl,
        photoType: 'after' as const,
        description: photoDto.description || '整改后照片',
      });
      await this.photoRepository.save(photo);
    }

    return this.findOne(id);
  }

  async recheck(id: number, recheckDto: RecheckRectificationDto, userId: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('整改单不存在');
    }
    if (order.status !== 'rectified') {
      throw new BadRequestException('只能复检已整改状态的整改单');
    }

    await this.orderRepository.update(id, {
      recheckResult: recheckDto.recheckResult,
      recheckReportId: recheckDto.recheckReportId,
      recheckedAt: new Date(),
      recheckedBy: userId,
      status: 'rechecked' as const,
    });

    if (recheckDto.recheckResult === 'fail') {
      const orderNo = await this.generateOrderNo();
      const deadlineDays = order.deadlineDays;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + deadlineDays);

      const newOrder = this.orderRepository.create({
        orderNo,
        reportId: order.reportId,
        storeId: order.storeId,
        itemScoreId: order.itemScoreId,
        title: `${order.title}（复检不合格重开）`,
        problemDescription: order.problemDescription,
        rectificationRequirements: `${order.rectificationRequirements}（复检不合格，请重新整改）`,
        deadlineDays,
        deadline,
        status: 'pending' as const,
        createdBy: userId,
      });

      const savedNewOrder = await this.orderRepository.save(newOrder);

      const beforePhotos = await this.photoRepository.find({
        where: { rectificationId: id, photoType: 'before' as const },
      });

      for (const photo of beforePhotos) {
        const rectPhoto = this.photoRepository.create({
          rectificationId: savedNewOrder.id,
          photoUrl: photo.photoUrl,
          photoType: 'before' as const,
          description: photo.description,
        });
        await this.photoRepository.save(rectPhoto);
      }
    }

    return this.findOne(id);
  }
}
