import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma.service';
import { AdminService } from '../src/admin/admin.service';

const supertest = (request as any).default || request;

describe('Audit E2E', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        // Setup DB for audit testing
        process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db?schema=public';

        const { execSync } = require('child_process');
        try {
            execSync('npx prisma db push --skip-generate', { env: process.env, stdio: 'ignore' });
        } catch (e) { }

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: ['error', 'warn'] });
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();

        prisma = moduleFixture.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    it('E2E-AUDIT-01: Full Audit Trail', async () => {
        // Clean up
        await prisma.user.deleteMany({ where: { email: 'audit-test@example.com' } });
        // @ts-ignore
        if (prisma.auditLog) {
            await prisma.auditLog.deleteMany();
        }

        // 1. Create user via admin service (should log PROVISION_USER)
        const adminService = app.get(AdminService);
        await adminService.createUser('audit-test@example.com', ['USER']);

        // 2. Login (should log LOGIN)
        const loginRes = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'audit-test@example.com', password: 'Welcome123' })
            .expect(201);

        const accessToken = loginRes.body.accessToken;

        // 3. Create an event (should log CREATE_EVENT)
        await supertest(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Audit Event',
                occurrence: new Date(Date.now() + 86400000).toISOString(),
            })
            .expect(201);

        // 4. Check audit logs exist
        // @ts-ignore
        const logs = await prisma.auditLog.findMany();

        expect(logs.length).toBeGreaterThan(0);

        // Verify specific actions
        const actions = logs.map(log => log.action);
        expect(actions).toContain('PROVISION_USER');
        expect(actions).toContain('LOGIN');
        expect(actions).toContain('CREATE_EVENT');
    });
});
