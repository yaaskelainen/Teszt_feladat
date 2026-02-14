import { Injectable, Inject } from '@nestjs/common';
import type { IAuditService } from '../domain/interfaces/IAuditService';
import type { IAuditRepository } from '../domain/interfaces/IAuditRepository';

@Injectable()
export class AuditService implements IAuditService {
    constructor(
        @Inject('IAuditRepository') private readonly auditRepo: IAuditRepository,
    ) { }

    async log(action: string, userId?: string, metadata?: any): Promise<void> {
        await this.auditRepo.save({
            action,
            userId,
            metadata: metadata ? JSON.stringify(metadata) : undefined,
        });
    }
}
