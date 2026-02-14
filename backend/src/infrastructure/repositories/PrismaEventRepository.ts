import { Injectable } from '@nestjs/common';
import type { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { Event } from '../../domain/entities/Event';
import { PrismaService } from '../prisma.service';

/**
 * PrismaEventRepository Adapter
 * Implementation of IEventRepository using Prisma ORM.
 */
@Injectable()
export class PrismaEventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Resolves a domain event by its primary key.
   */
  async findById(id: string): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    return event ? this.mapToDomain(event) : null;
  }

  /**
   * Requirement: UT-EVENT-003
   * Retrieves all events belonging to a specific owner.
   */
  async findManyByOwner(ownerId: string): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
      where: { ownerId },
      orderBy: { occurrence: 'asc' },
    });
    return events.map((e) => this.mapToDomain(e));
  }

  /**
   * Requirement: UT-EVENT-001, 004
   * Persists an event entity (Create if no ID, Update if ID exists).
   */
  async save(event: Event): Promise<Event> {
    const data = {
      ownerId: event.ownerId,
      title: event.title,
      occurrence: event.occurrence,
      description: event.description,
    };

    if (event.id && event.id.length > 0) {
      const updated = await this.prisma.event.update({
        where: { id: event.id },
        data,
      });
      return this.mapToDomain(updated);
    } else {
      const created = await this.prisma.event.create({
        data,
      });
      return this.mapToDomain(created);
    }
  }

  /**
   * Requirement: UT-EVENT-009
   * Removes an event record by ID.
   */
  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }

  /**
   * Mapping bridge between Prisma POJO and Domain Entity.
   */
  private mapToDomain(prismaEvent: any): Event {
    return new Event(
      prismaEvent.id,
      prismaEvent.ownerId,
      prismaEvent.title,
      prismaEvent.occurrence,
      prismaEvent.description,
      prismaEvent.createdAt,
      prismaEvent.updatedAt,
    );
  }
}
