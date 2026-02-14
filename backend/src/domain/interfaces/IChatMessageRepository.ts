import { ChatMessage } from '../entities/ChatMessage';

export interface IChatMessageRepository {
    save(message: ChatMessage): Promise<ChatMessage>;
    findAllByChatId(chatId: string): Promise<ChatMessage[]>;
    getActiveQueues(): Promise<{ chatId: string; lastMessage: string; senderId: string; isHumanRequired: boolean }[]>;
    updateAllByChatId(chatId: string, data: Partial<ChatMessage>): Promise<void>;
}
