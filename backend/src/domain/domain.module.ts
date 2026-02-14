import { Module, Global } from '@nestjs/common';
import type { IEmailService } from './interfaces/IEmailService';

// Simple Mock Email Service for now
export class MockEmailService implements IEmailService {
    async send(to: string, subject: string, body: string): Promise<void> {
        console.log(`[EmailService] To: ${to}, Subject: ${subject}, Body: ${body}`);
    }
}

@Global()
@Module({
    providers: [],
    exports: [],
})
export class DomainModule { }
