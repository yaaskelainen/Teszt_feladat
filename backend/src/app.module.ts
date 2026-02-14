import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { AdminModule } from './admin/admin.module';
import { HelpDeskModule } from './helpdesk/helpdesk.module';
import { UserModule } from './user/user.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    AuthModule,
    EventModule,
    AdminModule,
    HelpDeskModule,
    UserModule,
    AuditModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule { }
