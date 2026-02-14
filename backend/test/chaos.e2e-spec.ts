import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma.service'; // Fix path if needed
import { AuthService } from '../src/auth/auth.service';

describe('Journey: Stupid User & Edge Case Chaos', () => {
    let app: INestApplication;
    let user1Token: string;
    let adminToken: string;
    let spamToken: string;
    let prisma: PrismaService;
    let authService: AuthService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false })); // forbidNonWhitelisted: false to allow unexpected props if any

        // Explicitly seed DB for clean state
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        authService = moduleFixture.get<AuthService>(AuthService);

        // Clean up
        await prisma.event.deleteMany();
        await prisma.chatMessage.deleteMany();
        await prisma.user.deleteMany();

        // Create User 1
        const userHash = await authService.hashPassword('password123');
        const user1 = await prisma.user.create({
            data: {
                email: 'chaos@example.com',
                passwordHash: userHash,
                roles: ['USER'],
                mfaEnabled: false
            }
        });

        // Create Spam User
        const spamUser = await prisma.user.create({
            data: {
                email: 'spam@example.com',
                passwordHash: userHash,
                roles: ['USER'],
                mfaEnabled: false
            }
        });

        // Create Admin
        const adminHash = await authService.hashPassword('adminpassword');
        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                passwordHash: adminHash,
                roles: ['ADMIN'],
                mfaEnabled: false
            }
        });

        await app.init();

        // Login User 1
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'chaos@example.com', password: 'password123' });

        user1Token = loginRes.body.accessToken;

        // Login Spam User
        const spamLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'spam@example.com', password: 'password123' });
        spamToken = spamLoginRes.body.accessToken;

        const adminLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'admin@example.com', password: 'adminpassword' });

        adminToken = adminLoginRes.body.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('E2E-CHAOS-01: The "Double Clicker"', () => {
        it('should rate limit after 101 requests in a tight loop', async () => {
            // 101 requests in parallel to exceed the 100/min limit
            const requests: Promise<request.Response>[] = [];
            const payload = {
                title: 'Chaos Event',
                occurrence: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                description: 'Testing rate limit',
            };

            for (let i = 0; i < 101; i++) {
                requests.push(
                    request(app.getHttpServer())
                        .post('/events')
                        .set('Authorization', `Bearer ${spamToken}`)
                        .send(payload)
                );
            }

            const responses = await Promise.all(requests);
            const rateLimitedCount = responses.filter(r => r.status === 429).length;
            // Ensure at least some are blocked
            expect(responses.length).toBe(101);
            expect(rateLimitedCount).toBeGreaterThan(0);
        });
    });

    describe('E2E-CHAOS-02: The "Novelist"', () => {
        it('should reject a 500KB string in Help Desk Chat', async () => {
            const hugeString = 'a'.repeat(500 * 1024);
            const res = await request(app.getHttpServer())
                .post('/helpdesk/chat')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ content: hugeString });

            expect([400, 413]).toContain(res.status);
        });

        it('should validate max length (e.g. 2000 chars) with 400', async () => {
            const tooLong = 'a'.repeat(2001);
            const res = await request(app.getHttpServer())
                .post('/helpdesk/chat')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ content: tooLong });

            expect(res.status).toBe(400); // Bad Request from class-validator
        });
    });

    describe('E2E-CHAOS-03: The "Time Traveler"', () => {
        it('should reject date 0000-01-01T00:00:00Z', async () => {
            const res = await request(app.getHttpServer())
                .post('/events')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    title: 'Time Travel Event',
                    occurrence: '0000-01-01T00:00:00Z', // 1 BC if extended? ISO string might be valid
                    description: 'A long time ago',
                });

            expect(res.status).toBe(400); // Should be rejected by @MinDate
        });
    });

    describe('E2E-CHAOS-04: The "Script Kiddie"', () => {
        it('should accept XSS payload as text data', async () => {
            const xssPayload = '<script>alert("XSS")</script>';
            const res = await request(app.getHttpServer())
                .post('/events')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    title: xssPayload,
                    occurrence: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                    description: 'Safe description',
                });

            expect(res.status).toBe(201);

            const event = await prisma.event.findFirst({ where: { title: xssPayload } });
            expect(event).toBeDefined();
            expect(event!.title).toBe(xssPayload);
        });
    });

    describe('E2E-CHAOS-05: The "Ghost"', () => {
        it('should deny access after user deletion', async () => {
            const deleteRes = await request(app.getHttpServer())
                .delete('/users/me')
                .set('Authorization', `Bearer ${user1Token}`);

            expect(deleteRes.status).toBe(204);

            const listRes = await request(app.getHttpServer())
                .get('/events')
                .set('Authorization', `Bearer ${user1Token}`);

            expect(listRes.status).toBe(401);
        });
    });

    describe('E2E-CHAOS-06: The "Unicode Lover"', () => {
        it('should treat admin@exampIe.com (capital I) as distinct email', async () => {
            const trickyEmail = 'admin@exampIe.com';

            // This fails if adminToken is invalid, which happens if setup failed.
            // Or if admin@example.com didn't exist (handled in beforeAll).

            const createRes = await request(app.getHttpServer())
                .post('/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ email: trickyEmail, roles: ['USER'] });

            // If 409 Conflict -> It's NOT treating as distinct!
            expect(createRes.status).toBe(201);
        });
    });
});
