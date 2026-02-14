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

describe('4.1 Journey: Full Event Lifecycle (E2E)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userRepo: IUserRepository;
    let jwtToken: string;
    let createdEventId: string;

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

        // Create UserA
        const hash = await bcrypt.hash('passwordA', 10);
        await userRepo.create(new User('', 'usera@test.com', hash, ['USER']));
    });

    afterAll(async () => {
        await prismaService.event.deleteMany();
        await prismaService.user.deleteMany();
        await prismaService.$disconnect();
        await app.close();
    });

    it('E2E-FULL-01: Login', async () => {
        const res = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'usera@test.com', password: 'passwordA' })
            .expect(201);

        expect(res.body.accessToken).toBeDefined();
        jwtToken = res.body.accessToken;
    });

    it('E2E-FULL-02: Create Event', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        futureDate.setHours(0, 0, 0, 0); // Ensure it's not "now" but clearly future

        const res = await supertest(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                title: 'My Party',
                occurrence: futureDate.toISOString(),
                description: 'Original desc'
            })
            .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('My Party');
        createdEventId = res.body.id;
    });

    it('E2E-FULL-03: Verify List', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/events')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((e: any) => e.title === 'My Party')).toBe(true);
    });

    it('E2E-FULL-04: Update', async () => {
        const res = await supertest(app.getHttpServer())
            .patch(`/events/${createdEventId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ description: 'Updated desc' })
            .expect(200);

        expect(res.body.description).toBe('Updated desc');
    });

    it('E2E-FULL-05: Delete', async () => {
        await supertest(app.getHttpServer())
            .delete(`/events/${createdEventId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(204);

        // Verify it's gone
        const list = await supertest(app.getHttpServer())
            .get('/events')
            .set('Authorization', `Bearer ${jwtToken}`);
        expect(list.body.some((e: any) => e.id === createdEventId)).toBe(false);
    });
});
