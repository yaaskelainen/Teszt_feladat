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

describe('4.3 Journey: Help Desk Agent Dashboard (E2E)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userRepo: IUserRepository;
    let userToken: string;
    let agentToken: string;
    let userId: string;

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
        await prismaService.chatMessage.deleteMany();
        await prismaService.user.deleteMany();

        // Create UserA
        const userHash = await bcrypt.hash('userPass', 10);
        const createdUser = await userRepo.create(new User('', 'usera@test.com', userHash, ['USER']));
        userId = createdUser.id;

        // Create AgentUser
        const agentHash = await bcrypt.hash('agentPass', 10);
        await userRepo.create(new User('', 'agent@test.com', agentHash, ['AGENT']));

        // Login UserA
        const uRes = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'usera@test.com', password: 'userPass' });
        userToken = uRes.body.accessToken;

        // Login Agent
        const aRes = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'agent@test.com', password: 'agentPass' });
        agentToken = aRes.body.accessToken;
    });

    afterAll(async () => {
        await prismaService.chatMessage.deleteMany();
        await prismaService.user.deleteMany();
        await prismaService.$disconnect();
        await app.close();
    });

    it('E2E-AGENT-01: User Requests Help', async () => {
        const res = await supertest(app.getHttpServer())
            .post('/helpdesk/chat')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ content: 'I need help with my event' })
            .expect(201);

        expect(res.body).toHaveProperty('userMessage');
        expect(res.body).toHaveProperty('aiReply');
    });

    it('E2E-AGENT-02: Agent Views Queue', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/helpdesk/queue')
            .set('Authorization', `Bearer ${agentToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((q: any) => q.chatId === userId)).toBe(true);
    });

    it('E2E-AGENT-03: Agent Replies', async () => {
        await supertest(app.getHttpServer())
            .post('/helpdesk/reply')
            .set('Authorization', `Bearer ${agentToken}`)
            .send({ userId, content: 'Hello, how can I assist you?' })
            .expect(201);
    });

    it('E2E-AGENT-04: User Sees Reply', async () => {
        const res = await supertest(app.getHttpServer())
            .get('/helpdesk/history')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(res.body.length).toBeGreaterThanOrEqual(2);
        expect(res.body.some((m: any) => m.senderRole === 'AGENT' && m.content.includes('assist'))).toBe(true);
    });
});
