import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { Store } from '../../entities/store.entity';
import { SupervisionTask } from '../../entities/supervision-task.entity';
import { TaskStore } from '../../entities/task-store.entity';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { jwtConfig } from '../../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckinRecord, Store, SupervisionTask, TaskStore]),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
