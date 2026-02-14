jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    event = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    $connect = jest.fn();
    $disconnect = jest.fn();
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaEventRepository } from './PrismaEventRepository';
import { PrismaService } from '../prisma.service';
import { Event } from '../../domain/entities/Event';

const mockPrismaService = {
  event: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PrismaEventRepository', () => {
  let repository: PrismaEventRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaEventRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PrismaEventRepository>(PrismaEventRepository);
    jest.clearAllMocks();
  });

  describe('save', () => {
    /** Case UT-EREPO-001: Creation of a new database record */
    it('UT-EREPO-001: Save - Create New', async () => {
      const event = new Event('', 'u1', 'Title', new Date());
      const prismaEvent = {
        id: 'e1',
        ownerId: 'u1',
        title: 'Title',
        occurrence: event.occurrence,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.event.create.mockResolvedValue(prismaEvent);

      const result = await repository.save(event);

      expect(result.id).toBe('e1');
      expect(mockPrismaService.event.create).toHaveBeenCalled();
    });

    /** Case UT-EREPO-002: Updating an existing database record */
    it('UT-EREPO-002: Save - Update Existing', async () => {
      const event = new Event('e1', 'u1', 'Updated Title', new Date());
      const prismaEvent = {
        id: 'e1',
        ownerId: 'u1',
        title: 'Updated Title',
        occurrence: event.occurrence,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.event.update.mockResolvedValue(prismaEvent);

      const result = await repository.save(event);

      expect(result.title).toBe('Updated Title');
      expect(mockPrismaService.event.update).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    /** Case UT-EREPO-003: Retrieval of a specific event entity */
    it('UT-EREPO-003: Find By ID', async () => {
      const prismaEvent = {
        id: 'e1',
        ownerId: 'u1',
        title: 'T',
        occurrence: new Date(),
      };
      mockPrismaService.event.findUnique.mockResolvedValue(prismaEvent);

      const result = await repository.findById('e1');

      expect(result).toBeInstanceOf(Event);
      expect(result?.id).toBe('e1');
    });

    it('should return null if not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);
      const result = await repository.findById('missing');
      expect(result).toBeNull();
    });
  });

  describe('findManyByOwner', () => {
    /** Case UT-EREPO-004: Bulk retrieval for a specific owner */
    it('UT-EREPO-004: Find By Owner', async () => {
      const prismaEvents = [
        { id: 'e1', ownerId: 'u1', title: 'T1', occurrence: new Date() },
        { id: 'e2', ownerId: 'u1', title: 'T2', occurrence: new Date() },
      ];
      mockPrismaService.event.findMany.mockResolvedValue(prismaEvents);

      const result = await repository.findManyByOwner('u1');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Event);
    });
  });

  describe('delete', () => {
    it('should call prisma delete', async () => {
      mockPrismaService.event.delete.mockResolvedValue({});
      await repository.delete('e1');
      expect(mockPrismaService.event.delete).toHaveBeenCalledWith({
        where: { id: 'e1' },
      });
    });
  });
});
