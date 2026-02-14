import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { performance } from 'perf_hooks';

const supertest = (request as any).default || request;

describe('5.2 Performance Smoke Tests (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let authService: AuthService;
    let userToken: string;

    beforeAll(async () => {
        // Setup DB for performance testing
        process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db?schema=public&connection_limit=20';

        const { execSync } = require('child_process');
        try {
            execSync('npx prisma db push --skip-generate', { env: process.env, stdio: 'ignore' });
        } catch (e) { }

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.init();

        prisma = moduleFixture.get<PrismaService>(PrismaService);
        authService = moduleFixture.get<AuthService>(AuthService);

        // Setup test user
        await prisma.user.deleteMany({ where: { email: 'perf-test@example.com' } });
        const hash = await authService.hashPassword('password123');
        await prisma.user.create({
            data: {
                email: 'perf-test@example.com',
                passwordHash: hash,
                roles: ['USER'],
            }
        });

        // Warm up login for token
        const loginRes = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'perf-test@example.com', password: 'password123' });
        userToken = loginRes.body.accessToken;
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: 'perf-test@example.com' } });
        await app.close();
    });

    it('PERF-001: 100 concurrent Login requests (P95 < 800ms)', async () => {
        const loginPayload = { email: 'perf-test@example.com', password: 'password123' };
        const latencies: number[] = [];
        const count = 100;

        const requests = Array.from({ length: count }).map(async () => {
            const start = performance.now();
            await supertest(app.getHttpServer())
                .post('/auth/login')
                .send(loginPayload)
                .expect(201);
            const end = performance.now();
            latencies.push(end - start);
        });

        await Promise.all(requests);

        latencies.sort((a, b) => a - b);
        const p95Index = Math.floor(count * 0.95);
        const p95Latency = latencies[p95Index];

        console.log(`P95 Latency: ${p95Latency}ms`);
        expect(p95Latency).toBeLessThan(800);
    });

    it('PERF-002: Help Desk Chat latency (Response < 5s)', async () => {
        const start = performance.now();
        const res = await supertest(app.getHttpServer())
            .post('/helpdesk/chat')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ content: 'Need help' });

        const end = performance.now();
        const latency = end - start;

        console.log(`Help Desk Latency: ${latency}ms`);
        expect(res.status).toBe(201);
        expect(latency).toBeLessThan(5000);
    });
});
