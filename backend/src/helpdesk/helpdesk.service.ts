import { Injectable, Inject } from '@nestjs/common';
import type { IChatMessageRepository } from '../domain/interfaces/IChatMessageRepository';
import { ChatMessage } from '../domain/entities/ChatMessage';
import type { IAIService } from '../domain/interfaces/IAIService';

@Injectable()
export class HelpDeskService {
    constructor(
        @Inject('IChatMessageRepository') private readonly chatRepo: IChatMessageRepository,
        @Inject('IAIService') private readonly aiService: IAIService,
    ) { }

    /**
     * Requirement: UT-HELP-007 (Chat Resolution)
     * Marks a chat as resolved by clearing the 'isHumanRequired' flag on all messages.
     */
    async resolveChat(chatId: string): Promise<void> {
        await this.chatRepo.updateAllByChatId(chatId, { isHumanRequired: false });
    }


    /**
     * Requirement: UT-HELP-001, UT-HELP-005, UT-HELP-006 (Human Transfer)
     */
    async sendMessage(userId: string, content: string): Promise<any> {
        // 1. Check if chat already requires human or if new message requests it
        const history = await this.chatRepo.findAllByChatId(userId);
        const alreadyHumanRequired = history.some(m => m.isHumanRequired);

        const transferKeywords = ['human', 'person', 'agent', 'support', 'talk to somebody', 'representative'];
        const isTransferRequested = transferKeywords.some(kw => content.toLowerCase().includes(kw));

        const isHumanRequired = alreadyHumanRequired || isTransferRequested;

        // 2. Save user message
        const userMessage = new ChatMessage('', userId, userId, 'USER', content, isHumanRequired);
        const savedUserMsg = await this.chatRepo.save(userMessage);

        let aiReplyData: any = null;

        // 3. Generate AI reply only if human is NOT required
        if (!isHumanRequired) {
            const aiResponse = await this.aiService.generateResponse({
                query: content,
                history: history.map(m => ({
                    role: m.senderRole === 'USER' ? 'user' : 'model',
                    content: m.content
                })),
            });

            // 4. Save AI reply
            const aiMessage = new ChatMessage('', userId, 'AI_BOT', 'AGENT', aiResponse.text, false);
            const savedAiMsg = await this.chatRepo.save(aiMessage);

            aiReplyData = {
                id: savedAiMsg.id,
                content: savedAiMsg.content,
                role: 'AI' as const,
                timestamp: savedAiMsg.createdAt.toISOString(),
            };
        } else if (isTransferRequested && !alreadyHumanRequired) {
            // First time requesting human: AI acknowledges the transfer
            const aiMessage = new ChatMessage('', userId, 'AI_BOT', 'AGENT',
                "I've flagged this conversation for a human agent. They will get back to you shortly.", true);
            const savedAiMsg = await this.chatRepo.save(aiMessage);

            aiReplyData = {
                id: savedAiMsg.id,
                content: savedAiMsg.content,
                role: 'AI' as const,
                timestamp: savedAiMsg.createdAt.toISOString(),
            };
        }

        return {
            userMessage: {
                id: savedUserMsg.id,
                content: savedUserMsg.content,
                role: 'USER' as const,
                timestamp: savedUserMsg.createdAt.toISOString(),
                isHumanRequired: savedUserMsg.isHumanRequired
            },
            aiReply: aiReplyData,
        };
    }

    /**
     * Requirement: UT-HELP-002
     */
    async getQueue(): Promise<{ chatId: string; lastMessage: string; senderId: string }[]> {
        return await this.chatRepo.getActiveQueues();
    }

    /**
     * Requirement: UT-HELP-003
     */
    async replyToUser(agentId: string, userId: string, content: string): Promise<ChatMessage> {
        const message = new ChatMessage('', userId, agentId, 'AGENT', content);
        return await this.chatRepo.save(message);
    }

    /**
     * Requirement: UT-HELP-004
     */
    async getHistory(chatId: string): Promise<ChatMessage[]> {
        return await this.chatRepo.findAllByChatId(chatId);
    }
}
