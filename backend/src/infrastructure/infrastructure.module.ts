import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { PrismaEventRepository } from './repositories/PrismaEventRepository';
import { PrismaChatMessageRepository } from './repositories/PrismaChatMessageRepository';
import { PrismaAuditRepository } from './repositories/PrismaAuditRepository';
import { NodemailerEmailService } from './services/NodemailerEmailService';
import { GeminiAdapter } from '../ai/gemini.adapter';
import { MockAIAdapter } from '../ai/mock.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        PrismaService,
        {
            provide: 'API_KEY',
            useFactory: (config: ConfigService) => config.get<string>('GEMINI_API_KEY') || 'mock-key',
            inject: [ConfigService],
        },
        { provide: 'IUserRepository', useClass: PrismaUserRepository },
        { provide: 'IEventRepository', useClass: PrismaEventRepository },
        { provide: 'IChatMessageRepository', useClass: PrismaChatMessageRepository },
        { provide: 'IAuditRepository', useClass: PrismaAuditRepository },
        { provide: 'IEmailService', useClass: NodemailerEmailService },
        {
            provide: 'IAIService',
            useClass: process.env.NODE_ENV === 'test' ? MockAIAdapter : GeminiAdapter
        },
    ],
    exports: [
        PrismaService,
        'IUserRepository',
        'IEventRepository',
        'IChatMessageRepository',
        'IAuditRepository',
        'IAIService',
        'IEmailService'
    ],
})
export class InfrastructureModule { }
