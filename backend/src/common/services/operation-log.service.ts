import { Injectable, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from '../../entities/operation-log.entity';

export interface LogOperationOptions {
  module: string;
  action: string;
  targetId?: number;
  targetName?: string;
  details?: string;
}

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private operationLogRepository: Repository<OperationLog>,
  ) {}

  async log(user: any, options: LogOperationOptions, @Request() req?: any): Promise<OperationLog> {
    const { module, action, targetId, targetName, details } = options;

    const log = this.operationLogRepository.create({
      userId: user.id,
      userName: user.realName || user.username,
      module,
      action,
      targetId,
      targetName,
      ipAddress: req?.ip || req?.connection?.remoteAddress || undefined,
      userAgent: req?.headers?.['user-agent'] || undefined,
      details: details ? JSON.stringify(details) : undefined,
    });

    return this.operationLogRepository.save(log);
  }
}
