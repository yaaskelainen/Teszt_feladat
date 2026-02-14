import { Test, TestingModule } from '@nestjs/testing';
import { HelpDeskController } from './helpdesk.controller';
import { HelpDeskService } from './helpdesk.service';
import { ChatMessage } from '../domain/entities/ChatMessage';
import { UserThrottlerGuard } from '../auth/user-throttler.guard';

describe('HelpDeskController', () => {
    let controller: HelpDeskController;
    let service: any;

    beforeEach(async () => {
        service = {
            sendMessage: jest.fn(),
            getQueue: jest.fn(),
            replyToUser: jest.fn(),
            getHistory: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [HelpDeskController],
            providers: [
                { provide: HelpDeskService, useValue: service },
                {
                    provide: UserThrottlerGuard,
                    useValue: { canActivate: () => true },
                },
            ],
        })
            .overrideGuard(UserThrottlerGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<HelpDeskController>(HelpDeskController);
    });

    it('UT-HCTRL-001: Post Chat', async () => {
        const mockResponse = {
            userMessage: { id: '1', content: 'help', role: 'USER', timestamp: new Date().toISOString() },
            aiReply: { id: '2', content: 'AI', role: 'AI', timestamp: new Date().toISOString() },
        };
        service.sendMessage.mockResolvedValue(mockResponse);

        const result = await controller.sendMessage({ user: { id: 'u1' } }, { content: 'help' });

        expect(result).toEqual(mockResponse);
        expect(service.sendMessage).toHaveBeenCalledWith('u1', 'help');
    });

    it('UT-HCTRL-002: Get Queue', async () => {
        const mockQueue = [{ chatId: 'u1', lastMessage: 'help', senderId: 'u1' }];
        service.getQueue.mockResolvedValue(mockQueue);

        const result = await controller.getQueue();

        expect(result).toEqual(mockQueue);
        expect(service.getQueue).toHaveBeenCalled();
    });

    it('UT-HCTRL-003: Post Reply', async () => {
        const mockMsg = new ChatMessage('2', 'u1', 'agent1', 'AGENT', 'ok');
        service.replyToUser.mockResolvedValue(mockMsg);

        const result = await controller.reply({ user: { id: 'agent1' } }, { userId: 'u1', content: 'ok' });

        expect(result).toEqual(mockMsg);
        expect(service.replyToUser).toHaveBeenCalledWith('agent1', 'u1', 'ok');
    });

    it('UT-HCTRL-004: Get History', async () => {
        const mockHistory = [new ChatMessage('1', 'u1', 'u1', 'USER', 'help')];
        service.getHistory.mockResolvedValue(mockHistory);

        const result = await controller.getHistory({ user: { id: 'u1' } });

        expect(result).toEqual(mockHistory);
        expect(service.getHistory).toHaveBeenCalledWith('u1');
    });
});
