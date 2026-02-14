export class ChatMessage {
    constructor(
        public readonly id: string,
        public readonly chatId: string,
        public readonly senderId: string,
        public readonly senderRole: 'USER' | 'AGENT',
        public readonly content: string,
        public readonly isHumanRequired: boolean = false,
        public readonly createdAt: Date = new Date(),
    ) { }
}
