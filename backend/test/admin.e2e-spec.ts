import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma.service';
import { User } from '../src/domain/entities/User';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import { IUserRepository } from '../src/domain/interfaces/IUserRepository';

const supertest = (request as any).default || request;

describe('4.2 Journey: Admin Provisioning (E2E)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userRepo: IUserRepository;
    let adminToken: string;

    beforeAll(async () => {
        process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db?schema=public';
        process.env.JWT_SECRET = 'test_secret';

        try {
            execSync('npx prisma db push --skip-generate', { env: process.env, stdio: 'ignore' });
        } catch (e) { }

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        userRepo = moduleFixture.get<IUserRepository>('IUserRepository');

        await prismaService.$connect();
        await prismaService.event.deleteMany();
        await prismaService.user.deleteMany();

        // Create AdminUser
        const hash = await bcrypt.hash('adminPass', 10);
        await userRepo.create(new User('', 'admin@test.com', hash, ['ADMIN']));

        // Login as Admin to get token
        const res = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'admin@test.com', password: 'adminPass' });
        adminToken = res.body.accessToken;
    });

    afterAll(async () => {
        await prismaService.user.deleteMany();
        await prismaService.$disconnect();
        await app.close();
    });

    it('E2E-ADMIN-01: Create User via Admin', async () => {
        const res = await supertest(app.getHttpServer())
            .post('/admin/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'new@user.com',
                roles: ['USER']
            })
            .expect(201);

        expect(res.body.user.email).toBe('new@user.com');
        expect(res.body.user.roles).toContain('USER');
        expect(res.body.user.id).toBeDefined();
        expect(res.body.temporaryPassword).toBe('Welcome123');
    });

    it('E2E-ADMIN-02: Login as New User', async () => {
        const res = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'new@user.com',
                password: 'Welcome123' // Default password set in AdminService
            })
            .expect(201);

        expect(res.body.accessToken).toBeDefined();
    });

    it('E2E-SEC-ADM: Unauthorized Attempt', async () => {
        // Create a regular user
        const hash = await bcrypt.hash('userPass', 10);
        await userRepo.create(new User('', 'regular@test.com', hash, ['USER']));

        const loginRes = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'regular@test.com', password: 'userPass' });
        const userToken = loginRes.body.accessToken;

        // Try to access admin endpoint
        await supertest(app.getHttpServer())
            .post('/admin/users')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ email: 'attacker@test.com', roles: ['ADMIN'] })
            .expect(403);
    });

    it('E2E-ADMIN-03: Get User List', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/admin/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body.some((u: any) => u.email === 'admin@test.com')).toBe(true);
        expect(res.body[0]).not.toHaveProperty('passwordHash');
    });
});
