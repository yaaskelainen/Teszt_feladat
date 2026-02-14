import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma.service';
import { IUserRepository } from '../src/domain/interfaces/IUserRepository';
import { User } from '../src/domain/entities/User';
import * as bcrypt from 'bcrypt';
import { ChatMessage } from '../src/domain/entities/ChatMessage';

// Fix for supertest import
const supertest = (request as any).default || request;

describe('HelpDesk Chat Resolution (E2E)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userRepo: IUserRepository;
    let agentToken: string;
    let userToken: string;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        userRepo = moduleFixture.get<IUserRepository>('IUserRepository');

        // Cleanup
        await prismaService.chatMessage.deleteMany();
        await prismaService.user.deleteMany();

        // Create Agent
        const agentHash = await bcrypt.hash('agent123', 10);
        const agent = new User('agent-1', 'agent@test.com', agentHash, ['AGENT']);
        await userRepo.create(agent);

        // Create User
        const userHash = await bcrypt.hash('user123', 10);
        const user = new User('user-1', 'user@test.com', userHash, ['USER']);
        const createdUser = await userRepo.create(user);
        userId = createdUser.id;

        // Login Agent
        const agentLogin = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'agent@test.com', password: 'agent123' });
        agentToken = agentLogin.body.accessToken;

        // Login User
        const userLogin = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'user@test.com', password: 'user123' });
        userToken = userLogin.body.accessToken;
    }, 30000);

    afterAll(async () => {
        await prismaService.chatMessage.deleteMany();
        await prismaService.user.deleteMany();
        await app.close();
    });

    it('should allow agent to resolve chat and clear isHumanRequired flags', async () => {
        // 1. User sends message requesting human
        await supertest(app.getHttpServer())
            .post('/helpdesk/chat')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ content: 'I need a human agent' })
            .expect(201);

        // Verify it is flagged
        const queueRes = await supertest(app.getHttpServer())
            .get('/helpdesk/queue')
            .set('Authorization', `Bearer ${agentToken}`)
            .expect(200);

        const chatInQueue = queueRes.body.find((q: any) => q.chatId === userId);
        expect(chatInQueue).toBeDefined();
        expect(chatInQueue.isHumanRequired).toBe(true);

        // 2. Agent resolves chat
        await supertest(app.getHttpServer())
            .post('/helpdesk/resolve')
            .set('Authorization', `Bearer ${agentToken}`)
            .send({ chatId: userId })
            .expect(201);

        // 3. Verify flag is cleared
        const queueResAfter = await supertest(app.getHttpServer())
            .get('/helpdesk/queue')
            .set('Authorization', `Bearer ${agentToken}`)
            .expect(200);

        const chatInQueueAfter = queueResAfter.body.find((q: any) => q.chatId === userId);
        // It might still be in queue (if recent), but isHumanRequired should be false
        if (chatInQueueAfter) {
            expect(chatInQueueAfter.isHumanRequired).toBe(false);
        }

        // Verify history messages are cleared
        const historyRes = await supertest(app.getHttpServer())
            .get(`/helpdesk/history/${userId}`)
            .set('Authorization', `Bearer ${agentToken}`)
            .expect(200);

        const flaggedMessages = historyRes.body.filter((m: any) => m.isHumanRequired);
        expect(flaggedMessages.length).toBe(0);
    });
});
