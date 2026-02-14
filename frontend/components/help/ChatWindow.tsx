'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { ChatMessage } from '@/types/api';

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
    isSending?: boolean;
}

/**
 * ChatWindow Component
 * 
 * Implements REQ-HELP-001: AI Chat Interface
 * Displays conversation history between User and AI Agent.
 * 
 * Features:
 * - Auto-scroll to bottom on new message (REQ-UX-004)
 * - Distinct styling for User vs AI messages (REQ-UI-004)
 * - Loading indicators during connection/generation (REQ-UI-005)
 * - Markdown support for AI responses (REQ-UI-006)
 * 
 * Tested by: `frontend/components/help/ChatWindow.test.tsx`
 */
export function ChatWindow({ messages, isLoading, isSending }: ChatWindowProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // REQ-UX-004: Auto-scroll effect
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isSending]);

    if (isLoading && messages.length === 0) {
        return (
            <div className="flex h-[500px] flex-col items-center justify-center space-y-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-500">Connecting to AI Support...</p>
            </div>
        );
    }

    const safeFormatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            return format(date, 'HH:mm');
        } catch (e) {
            return '';
        }
    };

    return (
        <div
            ref={scrollRef}
            className="flex h-[500px] flex-col space-y-4 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-6 shadow-inner"
        >
            {messages.length === 0 && !isLoading && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 text-4xl">👋</div>
                    <h3 className="text-lg font-bold text-gray-900">How can I help you today?</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                        Ask me about event creation, ticket management, or common system issues.
                    </p>
                </div>
            )}

            {messages.map((msg) => {
                const isUser = msg.role === 'USER';
                return (
                    <div
                        key={msg.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${isUser
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                                }`}>
                                {isUser ? (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                ) : (
                                    <div className="prose prose-sm prose-blue max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                            <span className="mt-1 text-[10px] text-gray-400">
                                {safeFormatTime(msg.createdAt)}
                            </span>
                        </div>
                    </div>
                );
            })}

            {isSending && (
                <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="flex max-w-[80%] flex-col items-start text-gray-500">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm italic text-xs flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></span>
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></span>
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></span>
                            <span>AI is thinking...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
