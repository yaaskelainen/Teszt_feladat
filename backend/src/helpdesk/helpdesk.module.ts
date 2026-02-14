import { Module } from '@nestjs/common';
import { HelpDeskService } from './helpdesk.service';
import { HelpDeskController } from './helpdesk.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule],
    providers: [HelpDeskService],
    controllers: [HelpDeskController],
})
export class HelpDeskModule { }
