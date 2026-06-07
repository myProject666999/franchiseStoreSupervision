import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { InspectionReport } from '../../entities/inspection-report.entity';
import { InspectionItemScore } from '../../entities/inspection-item-score.entity';
import { InspectionPhoto } from '../../entities/inspection-photo.entity';
import { CheckItem } from '../../entities/check-item.entity';
import { CreateInspectionReportDto } from './dto/create-inspection-report.dto';
import { SubmitInspectionReportDto } from './dto/submit-inspection-report.dto';
import { QueryInspectionReportDto } from './dto/query-inspection-report.dto';
import { RectificationService } from '../rectification/rectification.service';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(InspectionReport)
    private reportRepository: Repository<InspectionReport>,
    @InjectRepository(InspectionItemScore)
    private itemScoreRepository: Repository<InspectionItemScore>,
    @InjectRepository(InspectionPhoto)
    private photoRepository: Repository<InspectionPhoto>,
    @InjectRepository(CheckItem)
    private checkItemRepository: Repository<CheckItem>,
    @Inject(forwardRef(() => RectificationService))
    private rectificationService: RectificationService,
  ) {}

  private async generateReportNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INSP${dateStr}`;
    
    const lastReport = await this.reportRepository.findOne({
      where: { reportNo: Like(`${prefix}%`) },
      order: { reportNo: 'DESC' },
    });

    let sequence = 1;
    if (lastReport) {
      const lastSeq = parseInt(lastReport.reportNo.slice(prefix.length), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(createDto: CreateInspectionReportDto, userId: number) {
    const reportNo = await this.generateReportNo();
    
    const report = this.reportRepository.create({
      ...createDto,
      reportNo,
      supervisorId: userId,
      totalScore: 0,
      maxScore: 0,
      scoreRate: 0,
      isPass: 1,
      problemCount: 0,
      mustPassFailed: 0,
      status: 'draft' as const,
    });

    return this.reportRepository.save(report);
  }

  async updateDraft(id: number, updateDto: Partial<CreateInspectionReportDto>) {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('检查报告不存在');
    }
    if (report.status !== 'draft') {
      throw new BadRequestException('只能更新草稿状态的报告');
    }

    await this.reportRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async submit(id: number, submitDto: SubmitInspectionReportDto, userId: number) {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('检查报告不存在');
    }
    if (report.status !== 'draft') {
      throw new BadRequestException('只能提交草稿状态的报告');
    }

    const { itemScores, photos, summary, improvementSuggestions, defaultDeadlineDays } = submitDto;

    let totalWeightedScore = 0;
    let totalMaxWeightedScore = 0;
    let problemCount = 0;
    let mustPassFailed = 0;

    const itemIds = itemScores.map(s => s.itemId);
    const checkItems = await this.checkItemRepository.findByIds(itemIds);
    const checkItemMap = new Map(checkItems.map(item => [item.id, item]));

    const savedItemScores: InspectionItemScore[] = [];

    for (const scoreDto of itemScores) {
      const checkItem = checkItemMap.get(scoreDto.itemId);
      if (!checkItem) {
        throw new BadRequestException(`检查项ID ${scoreDto.itemId} 不存在`);
      }

      const weightedScore = scoreDto.score * scoreDto.weight;
      const maxWeightedScore = scoreDto.maxScore * scoreDto.weight;
      
      const isPass = scoreDto.score >= scoreDto.maxScore ? 1 : 0;

      if (isPass === 0) {
        problemCount++;
        if (scoreDto.mustPass === 1) {
          mustPassFailed++;
        }
      }

      totalWeightedScore += weightedScore;
      totalMaxWeightedScore += maxWeightedScore;

      const itemScore = this.itemScoreRepository.create({
        reportId: id,
        itemId: scoreDto.itemId,
        categoryId: scoreDto.categoryId,
        score: scoreDto.score,
        maxScore: scoreDto.maxScore,
        weight: scoreDto.weight,
        weightedScore,
        isPass,
        mustPass: scoreDto.mustPass,
        problemDescription: scoreDto.problemDescription,
      });

      savedItemScores.push(await this.itemScoreRepository.save(itemScore));
    }

    const scoreRate = totalMaxWeightedScore > 0 
      ? (totalWeightedScore / totalMaxWeightedScore) * 100 
      : 0;
    
    const isPass = scoreRate >= 60 && mustPassFailed === 0 ? 1 : 0;

    if (photos && photos.length > 0) {
      for (const photoDto of photos) {
        const photo = this.photoRepository.create({
          reportId: id,
          itemScoreId: photoDto.itemScoreId,
          photoUrl: photoDto.photoUrl,
          photoType: photoDto.photoType,
          description: photoDto.description,
          sortOrder: photoDto.sortOrder || 0,
        });
        await this.photoRepository.save(photo);
      }
    }

    await this.reportRepository.update(id, {
      totalScore: totalWeightedScore,
      maxScore: totalMaxWeightedScore,
      scoreRate,
      isPass,
      problemCount,
      mustPassFailed,
      summary: summary || report.summary,
      improvementSuggestions: improvementSuggestions || report.improvementSuggestions,
      status: 'submitted' as const,
      submittedAt: new Date(),
    });

    if (problemCount > 0) {
      const failedItems = savedItemScores.filter(s => s.isPass === 0);
      await this.rectificationService.createFromInspectionReport(
        report,
        failedItems,
        userId,
        defaultDeadlineDays || 7,
      );
    }

    return this.findOne(id);
  }

  async findAll(queryDto: QueryInspectionReportDto) {
    const { page, pageSize, taskId, storeId, supervisorId, status, isPass, reportNo, startDate, endDate } = queryDto;
    const where: any = {};

    if (taskId !== undefined) where.taskId = taskId;
    if (storeId !== undefined) where.storeId = storeId;
    if (supervisorId !== undefined) where.supervisorId = supervisorId;
    if (status) where.status = status;
    if (isPass !== undefined) where.isPass = isPass;
    if (reportNo) where.reportNo = Like(`%${reportNo}%`);
    if (startDate && endDate) {
      where.inspectionDate = Between(new Date(startDate), new Date(endDate));
    }

    const [items, total] = await this.reportRepository.findAndCount({
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
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('检查报告不存在');
    }

    const itemScores = await this.itemScoreRepository.find({
      where: { reportId: id },
      order: { id: 'ASC' },
    });

    const photos = await this.photoRepository.find({
      where: { reportId: id },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    return {
      ...report,
      itemScores,
      photos,
    };
  }

  async confirm(id: number, userId: number) {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('检查报告不存在');
    }
    if (report.status !== 'submitted') {
      throw new BadRequestException('只能确认已提交状态的报告');
    }

    await this.reportRepository.update(id, {
      status: 'confirmed' as const,
      confirmedBy: userId,
      confirmedAt: new Date(),
    });

    return this.findOne(id);
  }
}
