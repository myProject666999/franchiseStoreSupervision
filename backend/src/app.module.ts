import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { databaseConfig, jwtConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AreaModule } from './modules/area/area.module';
import { StoreModule } from './modules/store/store.module';
import { CheckItemModule } from './modules/check-item/check-item.module';
import { SupervisionTaskModule } from './modules/supervision-task/supervision-task.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { InspectionModule } from './modules/inspection/inspection.module';
import { RectificationModule } from './modules/rectification/rectification.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
    AuthModule,
    UserModule,
    AreaModule,
    StoreModule,
    CheckItemModule,
    SupervisionTaskModule,
    CheckinModule,
    InspectionModule,
    RectificationModule,
    StatisticsModule,
  ],
})
export class AppModule {}
