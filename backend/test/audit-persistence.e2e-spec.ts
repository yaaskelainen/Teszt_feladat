import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/infrastructure/prisma.service';
// @ts-ignore
import { PrismaAuditRepository } from '../src/infrastructure/repositories/PrismaAuditRepository';
import { execSync } from 'child_process';

describe('Audit Persistence Integration', () => {
    let prismaService: PrismaService;
    let auditRepo: any;

    beforeAll(async () => {
        process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db?schema=public';

        try {
            execSync('npx prisma db push --skip-generate', {
                env: process.env,
                stdio: 'ignore'
            });
        } catch (e) { }

        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService, { provide: 'IAuditRepository', useClass: PrismaAuditRepository }],
        }).compile();

        prismaService = module.get<PrismaService>(PrismaService);
        auditRepo = module.get('IAuditRepository');

        await prismaService.$connect();
        // @ts-ignore
        await prismaService.auditLog.deleteMany();
    });

    afterAll(async () => {
        // @ts-ignore
        await prismaService.auditLog.deleteMany();
        await prismaService.$disconnect();
    });

    it('IT-SEC-001: Audit Trail Logging', async () => {
        const entry = {
            action: 'TEST_ACTION',
            userId: 'test-user',
            metadata: JSON.stringify({ key: 'value' }),
        };

        await auditRepo.save(entry);

        // @ts-ignore
        const saved = await prismaService.auditLog.findFirst({
            where: { action: 'TEST_ACTION' }
        });

        expect(saved).toBeDefined();
        expect(saved.userId).toBe('test-user');
    });
});
