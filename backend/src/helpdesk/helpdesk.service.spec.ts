import { Test, TestingModule } from '@nestjs/testing';
import { HelpDeskService } from './helpdesk.service';
import { ChatMessage } from '../domain/entities/ChatMessage';

describe('HelpDeskService', () => {
    let service: HelpDeskService;
    let chatRepo: any;

    beforeEach(async () => {
        chatRepo = {
            save: jest.fn(),
            getActiveQueues: jest.fn(),
            findAllByChatId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HelpDeskService,
                { provide: 'IChatMessageRepository', useValue: chatRepo },
                { provide: 'IAIService', useValue: { generateResponse: jest.fn().mockResolvedValue({ text: 'AI' }) } },
            ],
        }).compile();

        service = module.get<HelpDeskService>(HelpDeskService);
    });

    it('UT-HELP-001: Send Message', async () => {
        const mockUserMsg = new ChatMessage('1', 'u1', 'u1', 'USER', 'help');
        const mockAiMsg = new ChatMessage('2', 'u1', 'AI_BOT', 'AGENT', 'AI');
        chatRepo.save.mockResolvedValueOnce(mockUserMsg).mockResolvedValueOnce(mockAiMsg);
        chatRepo.findAllByChatId.mockResolvedValue([]);

        const result = await service.sendMessage('u1', 'help');

        expect(result.userMessage.id).toBe('1');
        expect(result.userMessage.timestamp).toBeDefined();
        expect(result.aiReply.id).toBe('2');
        expect(result.aiReply.timestamp).toBeDefined();
        expect(chatRepo.save).toHaveBeenCalledTimes(2);
    });

    it('UT-HELP-002: Get Queue', async () => {
        const mockQueue = [{ chatId: 'u1', lastMessage: 'help', senderId: 'u1' }];
        chatRepo.getActiveQueues.mockResolvedValue(mockQueue);

        const result = await service.getQueue();

        expect(result).toEqual(mockQueue);
        expect(chatRepo.getActiveQueues).toHaveBeenCalled();
    });

    it('UT-HELP-003: Reply to Chat', async () => {
        const mockMsg = new ChatMessage('2', 'u1', 'agent1', 'AGENT', 'ok');
        chatRepo.save.mockResolvedValue(mockMsg);

        const result = await service.replyToUser('agent1', 'u1', 'ok');

        expect(result).toEqual(mockMsg);
        expect(chatRepo.save).toHaveBeenCalled();
    });

    it('UT-HELP-004: Get History', async () => {
        const mockHistory = [new ChatMessage('1', 'u1', 'u1', 'USER', 'help')];
        chatRepo.findAllByChatId.mockResolvedValue(mockHistory);

        const result = await service.getHistory('u1');

        expect(result).toEqual(mockHistory);
        expect(chatRepo.findAllByChatId).toHaveBeenCalledWith('u1');
    });

    it('UT-HELP-005: AI Automated Reply', async () => {
        const aiService = {
            generateResponse: jest.fn().mockResolvedValue({ text: 'AI response' }),
        };

        // Re-create module with AI service mock
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HelpDeskService,
                { provide: 'IChatMessageRepository', useValue: chatRepo },
                { provide: 'IAIService', useValue: aiService },
            ],
        }).compile();

        const serviceWithAI = module.get<HelpDeskService>(HelpDeskService);

        const userMsg = new ChatMessage('1', 'u1', 'u1', 'USER', 'help');
        const aiMsg = new ChatMessage('2', 'u1', 'AI_BOT', 'AGENT', 'AI response');

        chatRepo.save.mockResolvedValueOnce(userMsg).mockResolvedValueOnce(aiMsg);
        chatRepo.findAllByChatId.mockResolvedValue([]);

        await serviceWithAI.sendMessage('u1', 'help');

        expect(aiService.generateResponse).toHaveBeenCalled();
        expect(chatRepo.save).toHaveBeenCalledTimes(2); // One for user, one for AI
    });
});
