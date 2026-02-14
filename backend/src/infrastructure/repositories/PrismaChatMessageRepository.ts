import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { IChatMessageRepository } from '../../domain/interfaces/IChatMessageRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';

@Injectable()
export class PrismaChatMessageRepository implements IChatMessageRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(message: ChatMessage): Promise<ChatMessage> {
        const created = await this.prisma.chatMessage.create({
            data: {
                chatId: message.chatId,
                senderId: message.senderId,
                senderRole: message.senderRole,
                content: message.content,
                isHumanRequired: message.isHumanRequired,
            },
        });
        return this.mapToDomain(created);
    }

    async findAllByChatId(chatId: string): Promise<ChatMessage[]> {
        const messages = await this.prisma.chatMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
        });
        return messages.map((m) => this.mapToDomain(m));
    }

    async getActiveQueues(): Promise<{ chatId: string; lastMessage: string; senderId: string; isHumanRequired: boolean }[]> {
        // Basic implementation: get all messages, group by chatId, take last.
        // In production, this would be a more complex raw query or a separate 'Chat' model.
        const messages = await this.prisma.chatMessage.findMany({
            orderBy: { createdAt: 'desc' },
            distinct: ['chatId'],
        });

        return messages.map(m => ({
            chatId: m.chatId,
            lastMessage: m.content,
            senderId: m.senderId,
            isHumanRequired: m.isHumanRequired
        }));
    }

    async updateAllByChatId(chatId: string, data: Partial<ChatMessage>): Promise<void> {
        await this.prisma.chatMessage.updateMany({
            where: { chatId },
            data: {
                isHumanRequired: data.isHumanRequired
            }
        });
    }

    private mapToDomain(m: any): ChatMessage {
        return new ChatMessage(m.id, m.chatId, m.senderId, m.senderRole as any, m.content, m.isHumanRequired, m.createdAt);
    }
}
