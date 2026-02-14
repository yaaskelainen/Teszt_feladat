import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma.service';
import { User } from '../src/domain/entities/User';
import { Event } from '../src/domain/entities/Event';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import { IUserRepository } from '../src/domain/interfaces/IUserRepository';
import { IEventRepository } from '../src/domain/interfaces/IEventRepository';

const supertest = (request as any).default || request;

describe('4.4 Journey: Security Barriers (E2E)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userRepo: IUserRepository;
    let eventRepo: IEventRepository;

    let userAToken: string;
    let userBToken: string;
    let eventAId: string;

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
        eventRepo = moduleFixture.get<IEventRepository>('IEventRepository');

        await prismaService.$connect();
        await prismaService.event.deleteMany();
        await prismaService.user.deleteMany();

        // Create User A
        const hashA = await bcrypt.hash('passA', 10);
        const userA = await userRepo.create(new User('', 'usera@test.com', hashA, ['USER']));

        // Create User B
        const hashB = await bcrypt.hash('passB', 10);
        const userB = await userRepo.create(new User('', 'userb@test.com', hashB, ['USER']));

        // Login User A
        const resA = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'usera@test.com', password: 'passA' });
        userAToken = resA.body.accessToken;

        // Login User B
        const resB = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'userb@test.com', password: 'passB' });
        userBToken = resB.body.accessToken;

        // User A creates an event - Use future date!
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const eventA = await eventRepo.save(new Event('', userA.id, 'UserA Event', futureDate));
        eventAId = eventA.id;
    });

    afterAll(async () => {
        await prismaService.user.deleteMany();
        await prismaService.$disconnect();
        await app.close();
    });

    it('E2E-SEC-01: Unauthorized Edit (Forbidden)', async () => {
        /**
         * Requirement: E2E-SEC-01
         * User B tries to patch Event A (owned by User A).
         */
        await supertest(app.getHttpServer())
            .patch(`/events/${eventAId}`)
            .set('Authorization', `Bearer ${userBToken}`)
            .send({ title: 'Hacked Title' })
            .expect(403);
    });

    it('E2E-SEC-02: Auth Bypass (Unauthorized)', async () => {
        /**
         * Requirement: E2E-SEC-02
         * Attacker uses a "fake" token string.
         */
        await supertest(app.getHttpServer())
            .get('/events')
            .set('Authorization', 'Bearer invalid-token-admin')
            .expect(401);
    });
});
