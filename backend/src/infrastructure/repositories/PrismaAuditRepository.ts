import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { IAuditRepository } from '../../domain/interfaces/IAuditRepository';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(entry: {
        action: string;
        userId?: string;
        metadata?: string;
    }): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                action: entry.action,
                userId: entry.userId,
                metadata: entry.metadata,
            },
        });
    }
}
