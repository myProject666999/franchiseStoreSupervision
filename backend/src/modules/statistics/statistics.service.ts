import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, IsNull, Not } from 'typeorm';
import { MonthlyScore } from '../../entities/monthly-score.entity';
import { InspectionReport } from '../../entities/inspection-report.entity';
import { InspectionItemScore } from '../../entities/inspection-item-score.entity';
import { RectificationOrder } from '../../entities/rectification-order.entity';
import { Store } from '../../entities/store.entity';
import { Area } from '../../entities/area.entity';
import { CheckCategory } from '../../entities/check-category.entity';
import { CalculateMonthlyDto } from './dto/calculate-monthly.dto';
import { QueryMonthlyScoreDto } from './dto/query-monthly-score.dto';
import { QueryStoreTrendDto } from './dto/query-store-trend.dto';
import { QueryAreaOverviewDto } from './dto/query-area-overview.dto';
import { QueryProblemDistributionDto } from './dto/query-problem-distribution.dto';

interface StoreStats {
  storeId: number;
  areaId: number;
  inspectionCount: number;
  totalScore: number;
  totalScoreRate: number;
  passCount: number;
  failCount: number;
  problemCount: number;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(MonthlyScore)
    private monthlyScoreRepository: Repository<MonthlyScore>,
    @InjectRepository(InspectionReport)
    private reportRepository: Repository<InspectionReport>,
    @InjectRepository(InspectionItemScore)
    private itemScoreRepository: Repository<InspectionItemScore>,
    @InjectRepository(RectificationOrder)
    private rectificationRepository: Repository<RectificationOrder>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    @InjectRepository(CheckCategory)
    private categoryRepository: Repository<CheckCategory>,
  ) {}

  async calculateMonthly(dto: CalculateMonthlyDto) {
    const { year, month, areaId } = dto;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const storeWhere: any = { status: 1 };
    if (areaId !== undefined) {
      storeWhere.areaId = areaId;
    }

    const stores = await this.storeRepository.find({
      where: storeWhere,
      select: ['id', 'areaId'],
    });

    if (stores.length === 0) {
      throw new BadRequestException('没有找到符合条件的门店');
    }

    const storeIds = stores.map(s => s.id);

    const reportStats = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.storeId', 'storeId')
      .addSelect('COUNT(report.id)', 'inspectionCount')
      .addSelect('SUM(report.totalScore)', 'totalScore')
      .addSelect('SUM(report.scoreRate)', 'totalScoreRate')
      .addSelect('SUM(CASE WHEN report.isPass = 1 THEN 1 ELSE 0 END)', 'passCount')
      .addSelect('SUM(CASE WHEN report.isPass = 0 THEN 1 ELSE 0 END)', 'failCount')
      .addSelect('SUM(report.problemCount)', 'problemCount')
      .where('report.storeId IN (:...storeIds)', { storeIds })
      .andWhere('report.inspectionDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('report.status = :status', { status: 'confirmed' })
      .groupBy('report.storeId')
      .getRawMany();

    const rectificationStats = await this.rectificationRepository
      .createQueryBuilder('rect')
      .select('rect.storeId', 'storeId')
      .addSelect('COUNT(rect.id)', 'rectificationCount')
      .where('rect.storeId IN (:...storeIds)', { storeIds })
      .andWhere('rect.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('rect.storeId')
      .getRawMany();

    const storeStatsMap = new Map<number, StoreStats & { rectificationCount: number }>();

    for (const store of stores) {
      storeStatsMap.set(store.id, {
        storeId: store.id,
        areaId: store.areaId,
        inspectionCount: 0,
        totalScore: 0,
        totalScoreRate: 0,
        passCount: 0,
        failCount: 0,
        problemCount: 0,
        rectificationCount: 0,
      });
    }

    for (const stat of reportStats) {
      const storeStat = storeStatsMap.get(Number(stat.storeId));
      if (storeStat) {
        storeStat.inspectionCount = Number(stat.inspectionCount) || 0;
        storeStat.totalScore = Number(stat.totalScore) || 0;
        storeStat.totalScoreRate = Number(stat.totalScoreRate) || 0;
        storeStat.passCount = Number(stat.passCount) || 0;
        storeStat.failCount = Number(stat.failCount) || 0;
        storeStat.problemCount = Number(stat.problemCount) || 0;
      }
    }

    for (const stat of rectificationStats) {
      const storeStat = storeStatsMap.get(Number(stat.storeId));
      if (storeStat) {
        storeStat.rectificationCount = Number(stat.rectificationCount) || 0;
      }
    }

    const allStats: Array<StoreStats & { avgScore: number; avgScoreRate: number; rectificationCount: number }> = [];

    for (const stats of storeStatsMap.values()) {
      const avgScore = stats.inspectionCount > 0 ? stats.totalScore / stats.inspectionCount : 0;
      const avgScoreRate = stats.inspectionCount > 0 ? stats.totalScoreRate / stats.inspectionCount : 0;

      allStats.push({
        ...stats,
        avgScore,
        avgScoreRate,
      });
    }

    allStats.sort((a, b) => b.avgScoreRate - a.avgScoreRate);

    const areaGroups = new Map<number, typeof allStats>();
    for (const stat of allStats) {
      if (!areaGroups.has(stat.areaId)) {
        areaGroups.set(stat.areaId, []);
      }
      areaGroups.get(stat.areaId)!.push(stat);
    }

    const monthlyScores: MonthlyScore[] = [];

    for (let i = 0; i < allStats.length; i++) {
      const stat = allStats[i];
      const areaStats = areaGroups.get(stat.areaId)!;
      const rankInArea = areaStats.findIndex(s => s.storeId === stat.storeId) + 1;
      const rankCity = i + 1;

      const existingScore = await this.monthlyScoreRepository.findOne({
        where: {
          storeId: stat.storeId,
          year,
          month,
        },
      });

      if (existingScore) {
        await this.monthlyScoreRepository.update(existingScore.id, {
          inspectionCount: stat.inspectionCount,
          avgScore: stat.avgScore,
          avgScoreRate: stat.avgScoreRate,
          passCount: stat.passCount,
          failCount: stat.failCount,
          problemCount: stat.problemCount,
          rectificationCount: stat.rectificationCount,
          rankInArea,
          rankCity,
        });
        monthlyScores.push(await this.monthlyScoreRepository.findOne({ where: { id: existingScore.id } }));
      } else {
        const newScore = this.monthlyScoreRepository.create({
          storeId: stat.storeId,
          areaId: stat.areaId,
          year,
          month,
          inspectionCount: stat.inspectionCount,
          avgScore: stat.avgScore,
          avgScoreRate: stat.avgScoreRate,
          passCount: stat.passCount,
          failCount: stat.failCount,
          problemCount: stat.problemCount,
          rectificationCount: stat.rectificationCount,
          rankInArea,
          rankCity,
        });
        monthlyScores.push(await this.monthlyScoreRepository.save(newScore));
      }
    }

    return {
      year,
      month,
      totalStores: stores.length,
      calculatedCount: monthlyScores.length,
      list: monthlyScores,
    };
  }

  async getMonthlyRanking(queryDto: QueryMonthlyScoreDto) {
    const { year, month, areaId, storeId, page, pageSize } = queryDto;

    if (!year || !month) {
      throw new BadRequestException('年份和月份为必填项');
    }

    const where: any = { year, month };
    if (areaId !== undefined) where.areaId = areaId;
    if (storeId !== undefined) where.storeId = storeId;

    const [items, total] = await this.monthlyScoreRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { rankCity: 'ASC' },
    });

    const storeIds = items.map(item => item.storeId);
    const stores = await this.storeRepository.findByIds(storeIds);
    const storeMap = new Map(stores.map(s => [s.id, s]));

    const areaIds = items.map(item => item.areaId);
    const areas = await this.areaRepository.findByIds(areaIds);
    const areaMap = new Map(areas.map(a => [a.id, a]));

    const itemsWithDetails = items.map(item => ({
      ...item,
      store: storeMap.get(item.storeId),
      area: areaMap.get(item.areaId),
    }));

    return {
      list: itemsWithDetails,
      total,
      page,
      pageSize,
    };
  }

  async getStoreTrend(queryDto: QueryStoreTrendDto) {
    const { storeId, startDate, endDate } = queryDto;

    if (!storeId) {
      return {
        store: null,
        trend: [],
      };
    }

    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) {
      throw new BadRequestException('门店不存在');
    }

    const where: any = { storeId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1;
      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;

      const monthlyScores = await this.monthlyScoreRepository
        .createQueryBuilder('ms')
        .where('ms.storeId = :storeId', { storeId })
        .andWhere(
          '((ms.year > :startYear) OR (ms.year = :startYear AND ms.month >= :startMonth))',
          { startYear, startMonth }
        )
        .andWhere(
          '((ms.year < :endYear) OR (ms.year = :endYear AND ms.month <= :endMonth))',
          { endYear, endMonth }
        )
        .orderBy('ms.year', 'ASC')
        .addOrderBy('ms.month', 'ASC')
        .getMany();

      return {
        store,
        trend: monthlyScores.map(ms => ({
          year: ms.year,
          month: ms.month,
          date: `${ms.year}-${String(ms.month).padStart(2, '0')}`,
          avgScore: ms.avgScore,
          avgScoreRate: ms.avgScoreRate,
          inspectionCount: ms.inspectionCount,
          passCount: ms.passCount,
          failCount: ms.failCount,
          problemCount: ms.problemCount,
          rankInArea: ms.rankInArea,
          rankCity: ms.rankCity,
        })),
      };
    }

    const history = await this.monthlyScoreRepository.find({
      where: { storeId },
      order: { year: 'ASC', month: 'ASC' },
    });

    return {
      store,
      trend: history.map(ms => ({
        year: ms.year,
        month: ms.month,
        date: `${ms.year}-${String(ms.month).padStart(2, '0')}`,
        avgScore: ms.avgScore,
        avgScoreRate: ms.avgScoreRate,
        inspectionCount: ms.inspectionCount,
        passCount: ms.passCount,
        failCount: ms.failCount,
        problemCount: ms.problemCount,
        rankInArea: ms.rankInArea,
        rankCity: ms.rankCity,
      })),
    };
  }

  async getAreaOverview(queryDto: QueryAreaOverviewDto) {
    const now = new Date();
    const { areaId, year = now.getFullYear(), month = now.getMonth() + 1 } = queryDto;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    let storeIds: number[];

    if (areaId) {
      const stores = await this.storeRepository.find({
        where: { areaId, status: 1 },
        select: ['id'],
      });
      storeIds = stores.map(s => s.id);
    } else {
      const stores = await this.storeRepository.find({
        where: { status: 1 },
        select: ['id'],
      });
      storeIds = stores.map(s => s.id);
    }

    const totalStores = storeIds.length;

    const reportStats = await this.reportRepository
      .createQueryBuilder('report')
      .select('COUNT(DISTINCT report.storeId)', 'inspectedStores')
      .addSelect('COUNT(report.id)', 'totalInspections')
      .addSelect('AVG(report.scoreRate)', 'avgScoreRate')
      .addSelect('SUM(CASE WHEN report.isPass = 1 THEN 1 ELSE 0 END)', 'passCount')
      .addSelect('SUM(CASE WHEN report.isPass = 0 THEN 1 ELSE 0 END)', 'failCount')
      .addSelect('SUM(report.problemCount)', 'totalProblems')
      .where('report.storeId IN (:...storeIds)', { storeIds })
      .andWhere('report.inspectionDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('report.status = :status', { status: 'confirmed' })
      .getRawOne();

    const rectificationStats = await this.rectificationRepository
      .createQueryBuilder('rect')
      .select('COUNT(rect.id)', 'totalRectifications')
      .addSelect('SUM(CASE WHEN rect.status IN (:...completedStatuses) THEN 1 ELSE 0 END)', 'completedRectifications')
      .where('rect.storeId IN (:...storeIds)', { storeIds })
      .andWhere('rect.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameter('completedStatuses', ['rectified', 'rechecked'])
      .getRawOne();

    const inspectedStores = Number(reportStats.inspectedStores) || 0;
    const totalInspections = Number(reportStats.totalInspections) || 0;
    const avgScoreRate = Number(reportStats.avgScoreRate) || 0;
    const passCount = Number(reportStats.passCount) || 0;
    const failCount = Number(reportStats.failCount) || 0;
    const totalProblems = Number(reportStats.totalProblems) || 0;
    const totalRectifications = Number(rectificationStats.totalRectifications) || 0;
    const completedRectifications = Number(rectificationStats.completedRectifications) || 0;

    const passRate = totalInspections > 0 ? (passCount / totalInspections) * 100 : 0;
    const rectificationCompletionRate = totalRectifications > 0
      ? (completedRectifications / totalRectifications) * 100
      : 0;

    const area = areaId ? await this.areaRepository.findOne({ where: { id: areaId } }) : null;

    return {
      year,
      month,
      area,
      overview: {
        totalStores,
        inspectedStores,
        totalInspections,
        avgScoreRate: Number(avgScoreRate.toFixed(2)),
        passRate: Number(passRate.toFixed(2)),
        passCount,
        failCount,
        totalProblems,
        totalRectifications,
        completedRectifications,
        rectificationCompletionRate: Number(rectificationCompletionRate.toFixed(2)),
      },
    };
  }

  async getProblemDistribution(queryDto: QueryProblemDistributionDto) {
    const { areaId, storeId, year, month } = queryDto;

    let storeIds: number[];

    if (storeId) {
      storeIds = [storeId];
    } else if (areaId) {
      const stores = await this.storeRepository.find({
        where: { areaId, status: 1 },
        select: ['id'],
      });
      storeIds = stores.map(s => s.id);
    } else {
      const stores = await this.storeRepository.find({
        where: { status: 1 },
        select: ['id'],
      });
      storeIds = stores.map(s => s.id);
    }

    if (storeIds.length === 0) {
      return {
        total: 0,
        distribution: [],
      };
    }

    const reportWhere: any = {
      storeId: In(storeIds),
      status: 'confirmed',
    };

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      reportWhere.inspectionDate = Between(startDate, endDate);
    }

    const reportIds = await this.reportRepository.find({
      where: reportWhere,
      select: ['id'],
    });

    if (reportIds.length === 0) {
      return {
        total: 0,
        distribution: [],
      };
    }

    const reportIdList = reportIds.map(r => r.id);

    const problemStats = await this.itemScoreRepository
      .createQueryBuilder('item')
      .select('item.categoryId', 'categoryId')
      .addSelect('COUNT(item.id)', 'problemCount')
      .addSelect('SUM(CASE WHEN item.isPass = 0 THEN 1 ELSE 0 END)', 'failedCount')
      .where('item.reportId IN (:...reportIdList)', { reportIdList })
      .andWhere('item.problemDescription IS NOT NULL')
      .andWhere('item.problemDescription != :empty', { empty: '' })
      .groupBy('item.categoryId')
      .getRawMany();

    const categoryIds = problemStats.map(p => Number(p.categoryId));
    const categories = await this.categoryRepository.findByIds(categoryIds);
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    const distribution = problemStats.map(stat => ({
      categoryId: Number(stat.categoryId),
      categoryName: categoryMap.get(Number(stat.categoryId))?.name || '未知分类',
      problemCount: Number(stat.problemCount) || 0,
      failedCount: Number(stat.failedCount) || 0,
    }));

    const total = distribution.reduce((sum, d) => sum + d.problemCount, 0);

    return {
      total,
      distribution,
    };
  }

  async getStoreHistory(storeId: number) {
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) {
      throw new BadRequestException('门店不存在');
    }

    const history = await this.monthlyScoreRepository.find({
      where: { storeId },
      order: { year: 'DESC', month: 'DESC' },
    });

    return {
      store,
      history,
    };
  }

  async getAreaSummary(queryDto: QueryMonthlyScoreDto) {
    const { year, month } = queryDto;

    if (!year || !month) {
      throw new BadRequestException('年份和月份为必填项');
    }

    const scores = await this.monthlyScoreRepository.find({
      where: { year, month },
    });

    const areaMap = new Map<number, {
      areaId: number;
      storeCount: number;
      totalInspectionCount: number;
      totalAvgScore: number;
      totalAvgScoreRate: number;
      totalPassCount: number;
      totalFailCount: number;
      totalProblemCount: number;
      totalRectificationCount: number;
    }>();

    for (const score of scores) {
      if (!areaMap.has(score.areaId)) {
        areaMap.set(score.areaId, {
          areaId: score.areaId,
          storeCount: 0,
          totalInspectionCount: 0,
          totalAvgScore: 0,
          totalAvgScoreRate: 0,
          totalPassCount: 0,
          totalFailCount: 0,
          totalProblemCount: 0,
          totalRectificationCount: 0,
        });
      }
      const area = areaMap.get(score.areaId)!;
      area.storeCount++;
      area.totalInspectionCount += score.inspectionCount;
      area.totalAvgScore += score.avgScore;
      area.totalAvgScoreRate += score.avgScoreRate;
      area.totalPassCount += score.passCount;
      area.totalFailCount += score.failCount;
      area.totalProblemCount += score.problemCount;
      area.totalRectificationCount += score.rectificationCount;
    }

    const areaIds = Array.from(areaMap.keys());
    const areas = await this.areaRepository.findByIds(areaIds);
    const areaEntityMap = new Map(areas.map(a => [a.id, a]));

    const summary = Array.from(areaMap.values()).map(area => ({
      areaId: area.areaId,
      areaName: areaEntityMap.get(area.areaId)?.name || '未知区域',
      storeCount: area.storeCount,
      avgInspectionCount: area.storeCount > 0 ? area.totalInspectionCount / area.storeCount : 0,
      avgScore: area.storeCount > 0 ? area.totalAvgScore / area.storeCount : 0,
      avgScoreRate: area.storeCount > 0 ? area.totalAvgScoreRate / area.storeCount : 0,
      totalPassCount: area.totalPassCount,
      totalFailCount: area.totalFailCount,
      totalProblemCount: area.totalProblemCount,
      totalRectificationCount: area.totalRectificationCount,
      passRate: area.totalPassCount + area.totalFailCount > 0
        ? (area.totalPassCount / (area.totalPassCount + area.totalFailCount)) * 100
        : 0,
    }));

    return {
      year,
      month,
      summary,
    };
  }
}
