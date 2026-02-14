import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
    imports: [AuthModule, InfrastructureModule],
    providers: [AdminService],
    controllers: [AdminController],
})
export class AdminModule { }
