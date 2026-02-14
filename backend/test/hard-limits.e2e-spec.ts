import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { NestExpressApplication } from '@nestjs/platform-express';

const supertest = (request as any).default || request;

describe('5.1 Hard Limits (E2E)', () => {
    let app: NestExpressApplication;
    let prisma: PrismaService;
    let authService: AuthService;
    let userToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestExpressApplication>({ logger: false });
        app.useBodyParser('json', { limit: '100kb' });
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.init();

        prisma = moduleFixture.get<PrismaService>(PrismaService);
        authService = moduleFixture.get<AuthService>(AuthService);

        // Setup test user
        await prisma.user.deleteMany({ where: { email: 'limit-test@example.com' } });
        const hash = await authService.hashPassword('password123');
        await prisma.user.create({
            data: {
                email: 'limit-test@example.com',
                passwordHash: hash,
                roles: ['USER'],
            }
        });

        const loginRes = await supertest(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'limit-test@example.com', password: 'password123' });
        userToken = loginRes.body.accessToken;
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: 'limit-test@example.com' } });
        await app.close();
    });

    it('should reject JSON body > 100kb', async () => {
        // Create a large object (~101kb)
        const largeString = 'a'.repeat(101 * 1024);
        const payload = { data: largeString };

        await supertest(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${userToken}`)
            .send(payload)
            .expect(413); // Payload Too Large
    });

    it('should reject Event Title > 150 characters', async () => {
        const longTitle = 'a'.repeat(151);
        await supertest(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: longTitle,
                occurrence: new Date(Date.now() + 86400000).toISOString(),
            })
            .expect(400); // Bad Request
    });

    it('should reject Event Description > 5000 characters', async () => {
        const longDesc = 'a'.repeat(5001);
        await supertest(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: 'Valid Title',
                occurrence: new Date(Date.now() + 86400000).toISOString(),
                description: longDesc
            })
            .expect(400); // Bad Request
    });

    it('should rate limit after 100 requests per minute', async () => {
        // We send 100 requests (which should pass) and then the 101st (which should fail with 429)
        const requests: Promise<any>[] = [];
        for (let i = 0; i < 100; i++) {
            requests.push(
                supertest(app.getHttpServer())
                    .get('/events')
                    .set('Authorization', `Bearer ${userToken}`)
            );
        }

        await Promise.all(requests);

        // The 101st request
        await supertest(app.getHttpServer())
            .get('/events')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(429); // Too Many Requests
    });
});
