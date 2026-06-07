import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RectificationOrder } from '../../entities/rectification-order.entity';
import { RectificationPhoto } from '../../entities/rectification-photo.entity';
import { InspectionItemScore } from '../../entities/inspection-item-score.entity';
import { InspectionPhoto } from '../../entities/inspection-photo.entity';
import { CheckItem } from '../../entities/check-item.entity';
import { RectificationService } from './rectification.service';
import { RectificationController } from './rectification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RectificationOrder, RectificationPhoto, InspectionItemScore, InspectionPhoto, CheckItem]),
  ],
  controllers: [RectificationController],
  providers: [RectificationService],
  exports: [RectificationService],
})
export class RectificationModule {}
