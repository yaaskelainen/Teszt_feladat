/**
 * useChat Hook (UT-HOOK-003)
 * Handles AI Help Desk interactions and history
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { ChatMessage, SendMessageDto, ChatResponse } from '@/types/api';
import { handleApiError } from '../utils/errors';

/**
 * useChat Hook
 * 
 * Centralizes logic for AI Help Desk Chat (REQ-HELP-LOGIC).
 * 
 * Capabilities:
 * - Message History Management (REQ-HELP-003)
 * - AI Response Handling (REQ-HELP-004): Sends user message and manages loading/response.
 * - Error Handling: Manages API communication errors.
 * 
 * Tested by: `frontend/lib/hooks/useChat.test.ts`
 */
export function useChat() {
    // Initial State: Welcome message (REQ-HELP-005)
    // In a real app, this might come from the backend or be empty.
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ChatMessage[]>('/helpdesk/history');
            setMessages(response.data);
        } catch (err: any) {
            setError(handleApiError(err).userMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        setIsSending(true);
        setError(null);

        // REQ-UX-005: Optimistic Update
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMsg: ChatMessage = {
            id: optimisticId,
            userId: '',
            content,
            role: 'USER',
            createdAt: new Date().toISOString()
        };

        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            const response = await apiClient.post<ChatResponse>('/helpdesk/chat', { content });

            // The backend returns both the user message and the AI reply
            const { userMessage, aiReply } = response.data;

            const newUserMsg: ChatMessage = {
                id: userMessage.id,
                userId: '',
                content: userMessage.content,
                role: 'USER',
                createdAt: userMessage.timestamp || new Date().toISOString()
            };

            const newAiMsg: ChatMessage = {
                id: aiReply.id,
                userId: 'system',
                content: aiReply.content,
                role: 'AI',
                createdAt: aiReply.timestamp || new Date().toISOString()
            };

            // Replace optimistic message with the real one and add AI response
            setMessages((prev) => {
                const filtered = prev.filter(m => m.id !== optimisticId);
                return [...filtered, newUserMsg, newAiMsg];
            });
        } catch (err: any) {
            // Remove optimistic message on error
            setMessages((prev) => prev.filter(m => m.id !== optimisticId));
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
            throw err;
        } finally {
            setIsSending(false);
        }
    }, []);

    const clearError = () => setError(null);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        messages,
        isLoading,
        isSending,
        error,
        sendMessage,
        fetchHistory,
        clearError
    };
}
