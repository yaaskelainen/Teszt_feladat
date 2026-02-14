import { Test, TestingModule } from '@nestjs/testing';
// @ts-ignore
import { AuditService } from './audit.service';

describe('AuditService', () => {
    let service: AuditService;
    let auditRepo: any;

    beforeEach(async () => {
        auditRepo = {
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditService,
                { provide: 'IAuditRepository', useValue: auditRepo },
            ],
        }).compile();

        service = module.get<AuditService>(AuditService);
    });

    it('UT-AUDIT-001: Log Security Event', async () => {
        const userId = 'u1';
        const action = 'LOGIN';
        const metadata = { ip: '127.0.0.1' };

        await service.log(action, userId, metadata);

        expect(auditRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            action,
            userId,
            metadata: JSON.stringify(metadata),
        }));
    });
});
