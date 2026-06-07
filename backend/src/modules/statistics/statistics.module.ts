import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { MonthlyScore } from '../../entities/monthly-score.entity';
import { InspectionReport } from '../../entities/inspection-report.entity';
import { InspectionItemScore } from '../../entities/inspection-item-score.entity';
import { RectificationOrder } from '../../entities/rectification-order.entity';
import { Store } from '../../entities/store.entity';
import { Area } from '../../entities/area.entity';
import { CheckCategory } from '../../entities/check-category.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MonthlyScore,
      InspectionReport,
      InspectionItemScore,
      RectificationOrder,
      Store,
      Area,
      CheckCategory,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, JwtService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
