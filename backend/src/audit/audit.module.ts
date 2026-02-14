import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';

@Global()
@Module({
    providers: [
        { provide: 'IAuditService', useClass: AuditService },
    ],
    exports: ['IAuditService'],
})
export class AuditModule { }
