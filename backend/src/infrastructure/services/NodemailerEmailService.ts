import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { IEmailService } from '../../domain/interfaces/IEmailService';

@Injectable()
export class NodemailerEmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
            port: this.configService.get<number>('SMTP_PORT', 587),
            secure: this.configService.get<boolean>('SMTP_SECURE', false),
            auth: {
                user: this.configService.get<string>('SMTP_USER', 'munka1900905@gmail.com'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });
    }

    async send(to: string, subject: string, body: string): Promise<void> {
        const mailOptions = {
            from: this.configService.get<string>('SMTP_FROM', '"Event Manager" <noreply@eventmanager.com>'),
            to,
            subject,
            text: body,
            html: body.replace(/\n/g, '<br/>'),
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] Email sent successfully to ${to}`);
        } catch (error) {
            console.error('[EmailService] Failed to send email:', error);
            // In a real app, we might want to throw or handle this specifically
        }
    }
}
