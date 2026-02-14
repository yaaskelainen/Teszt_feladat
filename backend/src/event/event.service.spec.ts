import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import type { IEventRepository } from '../domain/interfaces/IEventRepository';
import { Event } from '../domain/entities/Event';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockEventRepository = {
  findById: jest.fn(),
  findManyByOwner: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: 'IEventRepository', useValue: mockEventRepository },
        { provide: 'IAuditService', useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('UT-EVENT-001: Create Event - Success', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockSavedEvent = new Event(
        'e1',
        'u1',
        'Test Title',
        futureDate,
        'Desc',
      );
      mockEventRepository.save.mockResolvedValue(mockSavedEvent);

      const result = await service.createEvent(
        'u1',
        'Test Title',
        futureDate,
        'Desc',
      );

      expect(result).toEqual(mockSavedEvent);
      expect(mockEventRepository.save).toHaveBeenCalled();
    });

    it('UT-EVENT-002: Create Event - Past Date', async () => {
      const pastDate = new Date('1999-01-01');
      await expect(
        service.createEvent('u1', 'Old Event', pastDate),
      ).rejects.toThrow(BadRequestException);
    });

    it('UT-EVENT-007: Create Event - Emoji Title', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const emojiTitle = '🎉🎈🚀';

      const mockSavedEvent = new Event('e2', 'u1', emojiTitle, futureDate);
      mockEventRepository.save.mockResolvedValue(mockSavedEvent);

      const result = await service.createEvent('u1', emojiTitle, futureDate);

      expect(result.title).toBe(emojiTitle);
      expect(mockEventRepository.save).toHaveBeenCalled();
    });

    it('UT-EVENT-008: Create Event - Max Title Length', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const longTitle = 'a'.repeat(151);

      await expect(
        service.createEvent('u1', longTitle, futureDate),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserEvents', () => {
    it('UT-EVENT-003: Get User Events', async () => {
      const mockEvents = [
        new Event('e1', 'u1', 'Title 1', new Date()),
        new Event('e2', 'u1', 'Title 2', new Date()),
      ];
      mockEventRepository.findManyByOwner.mockResolvedValue(mockEvents);

      const result = await service.getUserEvents('u1');

      expect(result).toEqual(mockEvents);
      expect(mockEventRepository.findManyByOwner).toHaveBeenCalledWith('u1');
    });
  });

  describe('updateDescription', () => {
    it('UT-EVENT-004: Update Description - Success', async () => {
      const existingEvent = new Event(
        'e1',
        'u1',
        'Title',
        new Date(),
        'Old Desc',
      );
      mockEventRepository.findById.mockResolvedValue(existingEvent);
      mockEventRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.updateDescription('e1', 'u1', 'New Desc');

      expect(result.description).toBe('New Desc');
      expect(mockEventRepository.save).toHaveBeenCalled();
    });

    it('UT-EVENT-005: Update Desc - Not Owner', async () => {
      const existingEvent = new Event('e1', 'owner_id', 'Title', new Date());
      mockEventRepository.findById.mockResolvedValue(existingEvent);

      await expect(
        service.updateDescription('e1', 'stranger_id', 'New Desc'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('UT-EVENT-006: Update Desc - Event 404', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateDescription('non-existent', 'u1', 'New Desc'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEvent', () => {
    it('UT-EVENT-009: Delete Event - Success', async () => {
      const existingEvent = new Event('e1', 'u1', 'Title', new Date());
      mockEventRepository.findById.mockResolvedValue(existingEvent);
      mockEventRepository.delete.mockResolvedValue(undefined);

      await service.deleteEvent('e1', 'u1');

      expect(mockEventRepository.delete).toHaveBeenCalledWith('e1');
    });

    it('UT-EVENT-010: Delete Event - Not Owner', async () => {
      const existingEvent = new Event('e1', 'owner_id', 'Title', new Date());
      mockEventRepository.findById.mockResolvedValue(existingEvent);

      await expect(service.deleteEvent('e1', 'stranger_id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
