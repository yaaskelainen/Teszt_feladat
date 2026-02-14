import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { DomainModule } from '../src/domain/domain.module';
import { InfrastructureModule } from '../src/infrastructure/infrastructure.module';
import { AuditModule } from '../src/audit/audit.module';
import { PrismaService } from '../src/infrastructure/prisma.service';
import { User } from '../src/domain/entities/User';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import type { IUserRepository } from '../src/domain/interfaces/IUserRepository';

import { UserModule } from '../src/user/user.module';

// Handle potential ESM/CJS interop issues with supertest
const supertest = (request as any).default || request;

describe('3.3 Auth Controller Integration (API Layer)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userRepo: IUserRepository;

    beforeAll(async () => {
        // Setup DB
        process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db?schema=public';
        try {
            execSync('npx prisma db push --skip-generate', { env: process.env, stdio: 'ignore' });
        } catch (e) { }

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule, DomainModule, InfrastructureModule, AuditModule, UserModule],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        userRepo = moduleFixture.get<IUserRepository>('IUserRepository');

        await prismaService.$connect();
        await prismaService.event.deleteMany();
        await prismaService.user.deleteMany();

        const hash = await bcrypt.hash('password123', 10);
        await userRepo.create(new User('', 'api-user@test.com', hash, ['USER']));
    }, 30000);

    afterAll(async () => {
        if (prismaService) {
            await prismaService.event.deleteMany();
            await prismaService.user.deleteMany();
            await prismaService.$disconnect();
        }
        if (app) {
            await app.close();
        }
    }, 10000);

    describe('IT-API-001: POST /auth/login', () => {
        it('should return 201 Created and JWT tokens for valid credentials', () => {
            return supertest(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'api-user@test.com', password: 'password123' })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('accessToken');
                    expect(res.body).toHaveProperty('refreshToken');
                });
        });
    });

    describe('IT-API-002: POST /auth/login - JSON Syntax Error', () => {
        it('should return 400 for malformed JSON string', async () => {
            // Mock console.error to keep the test output clean since parsing errors might be logged
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            await supertest(app.getHttpServer())
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send('{ "email": "messy... ')
                .expect(400);
            consoleSpy.mockRestore();
        });
    });

    describe('IT-USER-001: GET /users/me', () => {
        it('should return 200 and user profile for valid token', async () => {
            // 1. Login to get token
            const loginRes = await supertest(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'api-user@test.com', password: 'password123' });

            const token = loginRes.body.accessToken;

            // 2. Access profile
            const res = await supertest(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.email).toBe('api-user@test.com');
            expect(res.body).not.toHaveProperty('passwordHash');
        });

        it('should return 401 for missing token', () => {
            return supertest(app.getHttpServer())
                .get('/users/me')
                .expect(401);
        });
    });
});
