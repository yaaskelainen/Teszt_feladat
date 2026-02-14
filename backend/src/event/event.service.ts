import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { IEventService } from '../domain/interfaces/IEventService';
import type { IEventRepository } from '../domain/interfaces/IEventRepository';
import { Event } from '../domain/entities/Event';

import type { IAuditService } from '../domain/interfaces/IAuditService';

/**
 * EventService Implementation
 * Handles business logic for event management.
 */
@Injectable()
export class EventService implements IEventService {
  constructor(
    @Inject('IEventRepository')
    private readonly eventRepository: IEventRepository,
    @Inject('IAuditService')
    private readonly auditService: IAuditService,
  ) { }

  /**
   * Requirement: UT-EVENT-001, 002, 007, 008
   * Creates a new event after validating date and title constraints.
   */
  async createEvent(
    userId: string,
    title: string,
    date: Date,
    desc?: string,
  ): Promise<Event> {
    // UT-EVENT-002: Ensure date is in the future
    if (date.getTime() < Date.now()) {
      throw new BadRequestException('Event date must be in the future');
    }

    // UT-EVENT-008: Validate title length
    if (title.length > 150) {
      throw new BadRequestException('Title too long');
    }

    // UT-EVENT-007 implicitly handled by TypeScript/JS Unicode strings
    const newEvent = new Event(
      '', // ID will be assigned by persistence layer or returned by save
      userId,
      title,
      date,
      desc,
    );

    const savedEvent = await this.eventRepository.save(newEvent);
    await this.auditService.log('CREATE_EVENT', userId, { eventId: savedEvent.id });
    return savedEvent;
  }

  /**
   * Requirement: UT-EVENT-003
   * Retrieves all events for a specific user.
   */
  async getUserEvents(userId: string): Promise<Event[]> {
    return await this.eventRepository.findManyByOwner(userId);
  }

  /**
   * Requirement: UT-EVENT-004, 005, 006
   * Updates an event's description after verifying ownership and existence.
   */
  async updateDescription(
    eventId: string,
    userId: string,
    newDesc: string,
  ): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    // UT-EVENT-006: Check existence
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // UT-EVENT-005: Verify ownership
    if (event.ownerId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    event.description = newDesc;
    const updatedEvent = await this.eventRepository.save(event);
    await this.auditService.log('UPDATE_EVENT', userId, { eventId });
    return updatedEvent;
  }

  /**
   * Requirement: UT-EVENT-009, 010
   * Deletes an event after verifying ownership.
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // UT-EVENT-010: Verify ownership
    if (event.ownerId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    await this.eventRepository.delete(eventId);
    await this.auditService.log('DELETE_EVENT', userId, { eventId });
  }
}
