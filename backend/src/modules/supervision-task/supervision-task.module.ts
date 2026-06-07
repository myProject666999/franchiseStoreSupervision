import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SupervisionTask } from '../../entities/supervision-task.entity';
import { TaskStore } from '../../entities/task-store.entity';
import { SupervisionTaskService } from './supervision-task.service';
import { SupervisionTaskController } from './supervision-task.controller';
import { jwtConfig } from '../../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupervisionTask, TaskStore]),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [SupervisionTaskController],
  providers: [SupervisionTaskService],
  exports: [SupervisionTaskService],
})
export class SupervisionTaskModule {}
