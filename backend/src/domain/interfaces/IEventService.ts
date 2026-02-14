import { Event } from '../entities/Event';

/**
 * IEventService Port
 * Interface for Event business logic and management.
 */
export interface IEventService {
  /** Creates a new event for a specific user */
  createEvent(
    userId: string,
    title: string,
    date: Date,
    desc?: string,
  ): Promise<Event>;
  /** Retrieves all events belonging to a specific user */
  getUserEvents(userId: string): Promise<Event[]>;
  /** Updates the description of an existing event */
  updateDescription(
    eventId: string,
    userId: string,
    newDesc: string,
  ): Promise<Event>;
  /** Deletes an event after owner verification */
  deleteEvent(eventId: string, userId: string): Promise<void>;
}
