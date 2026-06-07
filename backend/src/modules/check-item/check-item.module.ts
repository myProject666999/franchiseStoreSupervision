import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckCategory } from '../../entities/check-category.entity';
import { CheckItem } from '../../entities/check-item.entity';
import { CategoryService } from './category.service';
import { CheckItemService } from './check-item.service';
import { CategoryController } from './category.controller';
import { CheckItemController } from './check-item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CheckCategory, CheckItem])],
  controllers: [CategoryController, CheckItemController],
  providers: [CategoryService, CheckItemService],
  exports: [CategoryService, CheckItemService],
})
export class CheckItemModule {}
