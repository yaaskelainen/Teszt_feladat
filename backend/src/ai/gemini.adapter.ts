import {
  Injectable,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAIService } from '../domain/interfaces/IAIService';
import {
  AIChatRequest,
  AIChatResponse,
} from '../domain/interfaces/IAIService';

/**
 * GeminiAdapter
 * Implementation of IAIService using Google's Gemini Pro.
 */
@Injectable()
export class GeminiAdapter implements IAIService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;

  constructor(
    /** API Key provided via Injection Token or ConfigService */
    @Inject('API_KEY') private readonly apiKey: string,
  ) {
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Using 2.0 flash model verified to be available for this key
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  }

  /**
   * Requirement: UT-AI-001, 002, 003, 004
   * Generates a response using Gemini API with RAG context support.
   */
  async generateResponse(request: AIChatRequest): Promise<AIChatResponse> {
    // UT-AI-004: Guard against empty or whitespace-only queries
    if (!request.query || request.query.trim().length === 0) {
      return { text: 'Please ask a question.' };
    }

    try {
      // UT-AI-002: Context Handler
      // Combine context documents with the user query to provide RAG capabilities.
      let prompt = request.query;
      if (request.contextDocuments && request.contextDocuments.length > 0) {
        const context = request.contextDocuments.join('\n');
        prompt = `Context: ${context}\n\nUser: ${request.query}`;
      }

      // Note: For multi-turn history, model.startChat() would be used.
      // For simplicity in matching the test requirements for generateContent:
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // UT-AI-001: Return the generated text
      return {
        text,
        sourceReferences: request.contextDocuments
          ? ['internal_knowledge']
          : [],
      };
    } catch (error) {
      // UT-AI-003: API Failure handling
      // Log the actual error internally and throw a generic ServiceUnavailableException
      console.error('[GeminiAdapter] External API Error:', error);
      throw new ServiceUnavailableException(
        'The AI integration is temporarily unavailable.',
      );
    }
  }

  /**
   * Requirement component
   * Generates embeddings for vector search (RAG preparation).
   */
  async embedText(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({
        model: 'embedding-001',
      });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      throw new ServiceUnavailableException('Embedding service unavailable');
    }
  }
}
