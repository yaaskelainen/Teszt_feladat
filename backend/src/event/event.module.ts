import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule],
    controllers: [EventController],
    providers: [EventService],
    exports: [EventService],
})
export class EventModule { }
