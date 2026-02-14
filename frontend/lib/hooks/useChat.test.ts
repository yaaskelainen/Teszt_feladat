/**
 * useChat Hook Tests (UT-HOOK-003)
 * TDD: Writing tests FIRST
 */
/// <reference types="@testing-library/jest-dom" />

import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from './useChat';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
    }
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useChat Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch chat history on initial load', async () => {
        const mockHistory = [
            { id: '1', content: 'Hello', role: 'USER', createdAt: new Date().toISOString() },
            { id: '2', content: 'Hi there', role: 'AI', createdAt: new Date().toISOString() },
        ];
        (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockHistory });

        const { result } = renderHook(() => useChat());

        await waitFor(() => {
            expect(result.current.messages).toEqual(mockHistory);
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/helpdesk/history');
    });

    test('should send a message and receive AI reply', async () => {
        (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: [] });

        const mockResponse = {
            data: {
                userMessage: { id: '3', content: 'Help', role: 'USER', timestamp: new Date().toISOString() },
                aiReply: { id: '4', content: 'I am here', role: 'AI', timestamp: new Date().toISOString() }
            }
        };
        (mockedApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useChat());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.sendMessage('Help');
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/helpdesk/chat', { content: 'Help' });
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[1].content).toBe('I am here');
    });

    test('should handle send error', async () => {
        (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: [] });
        (mockedApiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useChat());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            try {
                await result.current.sendMessage('Fail');
            } catch (err) { }
        });

        expect(result.current.error).toBeDefined();
    });
});
