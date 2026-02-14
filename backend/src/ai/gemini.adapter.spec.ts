import { Test, TestingModule } from '@nestjs/testing';
import { GeminiAdapter } from './gemini.adapter';
import { ServiceUnavailableException } from '@nestjs/common';

// Mock the GoogleGenerativeAI SDK
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
});

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
    })),
}));

describe('GeminiAdapter', () => {
    let adapter: GeminiAdapter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GeminiAdapter, { provide: 'API_KEY', useValue: 'test-key' }],
        }).compile();

        adapter = module.get<GeminiAdapter>(GeminiAdapter);
        jest.clearAllMocks();
    });

    describe('generateResponse', () => {
        it('UT-AI-001: Generate Response - Success', async () => {
            mockGenerateContent.mockResolvedValue({
                response: { text: () => 'Hello user!' },
            });

            const result = await adapter.generateResponse({
                query: 'Hi',
                history: [],
            });

            expect(result.text).toBe('Hello user!');
            expect(mockGenerateContent).toHaveBeenCalled();
        });

        it('UT-AI-002: Context Handler - Combined Prompt', async () => {
            mockGenerateContent.mockResolvedValue({
                response: { text: () => 'Response' },
            });

            await adapter.generateResponse({
                query: 'Ask',
                history: [],
                contextDocuments: ['Doc A', 'Doc B'],
            });

            // Verify that the prompt contains both context and query
            const callArgs = mockGenerateContent.mock.calls[0][0];
            const prompt =
                typeof callArgs === 'string' ? callArgs : JSON.stringify(callArgs);

            expect(prompt).toContain('Context:');
            expect(prompt).toContain('Doc A');
            expect(prompt).toContain('Doc B');
            expect(prompt).toContain('User: Ask');
        });

        it('UT-AI-003: API Failure - ServiceUnavailable', async () => {
            // Mock console.error to keep the test output clean since we expect an error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            mockGenerateContent.mockRejectedValue(new Error('SDK Error'));

            await expect(
                adapter.generateResponse({ query: 'Hi', history: [] }),
            ).rejects.toThrow(ServiceUnavailableException);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('UT-AI-004: Empty Prompt', async () => {
            const result = await adapter.generateResponse({
                query: '   ',
                history: [],
            });

            expect(result.text).toBe('Please ask a question.');
            // Should NOT call the SDK
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });
    });
});
