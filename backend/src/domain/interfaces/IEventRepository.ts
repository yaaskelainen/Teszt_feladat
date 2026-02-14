import { Event } from '../entities/Event';

/**
 * IEventRepository Port
 * Interface for Event data persistence operations.
 */
export interface IEventRepository {
  /** Finds an event by its unique ID */
  findById(id: string): Promise<Event | null>;
  /** Retrieves all events belonging to a specific owner */
  findManyByOwner(ownerId: string): Promise<Event[]>;
  /** Persists an event (create or update) */
  save(event: Event): Promise<Event>;
  /** Removes an event record by ID */
  delete(id: string): Promise<void>;
}
