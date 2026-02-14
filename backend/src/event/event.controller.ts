import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, HttpCode } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserThrottlerGuard } from '../auth/user-throttler.guard';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
export class EventController {
    constructor(private readonly eventService: EventService) { }

    /**
     * Requirement: UT-EVCTRL-001, E2E-FULL-02
     * Create a new event.
     */
    @Post()
    create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
        return this.eventService.createEvent(
            req.user.id,
            createEventDto.title,
            createEventDto.occurrence,
            createEventDto.description
        );
    }

    /**
     * Requirement: UT-EVCTRL-002, E2E-FULL-03
     * List all events for the current user.
     */
    @Get()
    async findAll(@Request() req: any) {
        return await this.eventService.getUserEvents(req.user.id);
    }

    /**
     * Requirement: UT-EVCTRL-003, E2E-FULL-04
     * Update an event description.
     */
    @Patch(':id')
    async update(@Param('id') id: string, @Request() req: any, @Body() updateEventDto: any) {
        return await this.eventService.updateDescription(id, req.user.id, updateEventDto.description);
    }

    /**
     * Requirement: UT-EVCTRL-004, E2E-FULL-05
     * Authoritative deletion of an event.
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string, @Request() req: any) {
        return await this.eventService.deleteEvent(id, req.user.id);
    }
}
