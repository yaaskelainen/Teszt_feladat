import { Injectable } from '@nestjs/common';
import type { IAIService } from '../domain/interfaces/IAIService';
import { AIChatRequest, AIChatResponse } from '../domain/interfaces/IAIService';

/**
 * MockAIAdapter
 * A simple mock implementation of IAIService for testing purposes.
 * Returns canned responses without making external API calls.
 */
@Injectable()
export class MockAIAdapter implements IAIService {
    async generateResponse(request: AIChatRequest): Promise<AIChatResponse> {
        if (!request.query || request.query.trim().length === 0) {
            return { text: 'Please ask a question.' };
        }

        // Return a simple mock response
        return {
            text: `Mock AI response to: ${request.query}`,
            sourceReferences: [],
        };
    }

    async embedText(text: string): Promise<number[]> {
        // Return a mock embedding
        return new Array(768).fill(0).map(() => Math.random());
    }
}
