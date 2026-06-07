import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CalculateMonthlyDto } from './dto/calculate-monthly.dto';
import { QueryMonthlyScoreDto } from './dto/query-monthly-score.dto';
import { QueryStoreTrendDto } from './dto/query-store-trend.dto';
import { QueryAreaOverviewDto } from './dto/query-area-overview.dto';
import { QueryProblemDistributionDto } from './dto/query-problem-distribution.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('monthly-ranking')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  getMonthlyRanking(@Query() queryDto: QueryMonthlyScoreDto) {
    return this.statisticsService.getMonthlyRanking(queryDto);
  }

  @Get('store-trend')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  getStoreTrend(@Query() queryDto: QueryStoreTrendDto) {
    return this.statisticsService.getStoreTrend(queryDto);
  }

  @Get('area-overview')
  @Roles('admin', 'area_manager')
  getAreaOverview(@Query() queryDto: QueryAreaOverviewDto) {
    return this.statisticsService.getAreaOverview(queryDto);
  }

  @Get('problem-distribution')
  @Roles('admin', 'area_manager', 'supervisor', 'store_manager')
  getProblemDistribution(@Query() queryDto: QueryProblemDistributionDto) {
    return this.statisticsService.getProblemDistribution(queryDto);
  }

  @Post('calculate-monthly')
  @Roles('admin')
  calculateMonthly(@Body() dto: CalculateMonthlyDto) {
    return this.statisticsService.calculateMonthly(dto);
  }

  @Get('area-summary')
  @Roles('admin', 'area_manager')
  getAreaSummary(@Query() queryDto: QueryMonthlyScoreDto) {
    return this.statisticsService.getAreaSummary(queryDto);
  }
}
