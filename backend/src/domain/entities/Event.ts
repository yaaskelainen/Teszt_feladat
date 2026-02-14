/**
 * Event Domain Entity
 * Represents a calendar event created by a user.
 */
export class Event {
  constructor(
    /** Unique identifier for the event */
    public readonly id: string,
    /** ID of the user who owns this event */
    public readonly ownerId: string,
    /** Title or name of the event */
    public title: string,
    /** Date and time when the event occurs */
    public occurrence: Date,
    /** Optional detailed description of the event */
    public description?: string,
    /** Timestamp of when the event record was created */
    public readonly createdAt: Date = new Date(),
    /** Timestamp of the last update to the event record */
    public readonly updatedAt: Date = new Date(),
  ) {}
}
