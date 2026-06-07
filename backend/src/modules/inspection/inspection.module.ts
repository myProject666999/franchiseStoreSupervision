import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionReport } from '../../entities/inspection-report.entity';
import { InspectionItemScore } from '../../entities/inspection-item-score.entity';
import { InspectionPhoto } from '../../entities/inspection-photo.entity';
import { CheckItem } from '../../entities/check-item.entity';
import { InspectionService } from './inspection.service';
import { InspectionController } from './inspection.controller';
import { RectificationModule } from '../rectification/rectification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InspectionReport, InspectionItemScore, InspectionPhoto, CheckItem]),
    forwardRef(() => RectificationModule),
  ],
  controllers: [InspectionController],
  providers: [InspectionService],
  exports: [InspectionService],
})
export class InspectionModule {}
