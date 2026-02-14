import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from '../domain/entities/Event';
import { UserThrottlerGuard } from '../auth/user-throttler.guard';

describe('EventController', () => {
    let controller: EventController;
    let service: Partial<EventService>;

    beforeEach(async () => {
        service = {
            createEvent: jest.fn(),
            getUserEvents: jest.fn(),
            updateDescription: jest.fn(),
            deleteEvent: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventController],
            providers: [
                { provide: EventService, useValue: service },
                {
                    provide: UserThrottlerGuard,
                    useValue: { canActivate: () => true },
                },
            ],
        })
            .overrideGuard(UserThrottlerGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<EventController>(EventController);
    });

    it('UT-EVCTRL-001: Create Event', async () => {
        const date = new Date();
        const mockEvent = new Event('e1', 'u1', 'Party', date);
        (service.createEvent as jest.Mock).mockResolvedValue(mockEvent);

        const dto = { title: 'Party', occurrence: date };
        // We simulate getting userId from a request (e.g. via @User() decorator)
        const result = await controller.create(dto, { user: { id: 'u1' } });

        expect(result).toEqual(mockEvent);
        expect(service.createEvent).toHaveBeenCalledWith('u1', 'Party', date, undefined);
    });

    it('UT-EVCTRL-002: List Events', async () => {
        const mockEvents = [new Event('e1', 'u1', 'Party', new Date())];
        (service.getUserEvents as jest.Mock).mockResolvedValue(mockEvents);

        const result = await controller.findAll({ user: { id: 'u1' } });

        expect(result).toEqual(mockEvents);
        expect(service.getUserEvents).toHaveBeenCalledWith('u1');
    });

    it('UT-EVCTRL-003: Update Description', async () => {
        const mockEvent = new Event('e1', 'u1', 'Party', new Date(), 'New content');
        (service.updateDescription as jest.Mock).mockResolvedValue(mockEvent);

        const result = await controller.update('e1', { user: { id: 'u1' } }, { description: 'New content' });

        expect(result).toEqual(mockEvent);
        expect(service.updateDescription).toHaveBeenCalledWith('e1', 'u1', 'New content');
    });

    it('UT-EVCTRL-004: Delete Event', async () => {
        (service.deleteEvent as jest.Mock).mockResolvedValue(undefined);

        await controller.remove('e1', { user: { id: 'u1' } });

        expect(service.deleteEvent).toHaveBeenCalledWith('e1', 'u1');
    });
});
