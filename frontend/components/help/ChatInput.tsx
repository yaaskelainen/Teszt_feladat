'use client';

import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '@/lib/hooks/useSpeechToText';
import { cn } from '@/lib/utils/cn';
import { Button } from '../ui/Button';

interface ChatInputProps {
    onSend: (content: string) => Promise<void>;
    disabled?: boolean;
}

/**
 * ChatInput Component
 * 
 * Implements REQ-HELP-002: Message Input
 * Input field for sending messages to the AI Help Desk.
 * 
 * Features:
 * - Enter key to send (REQ-UX-006)
 * - Disabled state during processing (REQ-UI-003)
 * - Input validation (non-empty check)
 * - Speech-to-Text support (REQ-UI-007)
 * 
 * Tested by: `frontend/components/help/ChatInput.test.tsx`
 */
export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [content, setContent] = React.useState('');
    const { isRecording, transcript, startRecording, stopRecording } = useSpeechToText();
    const [lastContent, setLastContent] = React.useState('');

    // Update content when transcript changes during recording
    React.useEffect(() => {
        if (isRecording) {
            setContent(lastContent + transcript);
        }
    }, [transcript, isRecording, lastContent]);

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setLastContent(content ? content + ' ' : '');
            startRecording();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || disabled) return;

        if (isRecording) stopRecording();

        const message = content;
        setContent(''); // Clear immediately for snappiness
        setLastContent('');
        try {
            await onSend(message);
        } catch (err) {
            setContent(message); // Restore on failure
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative mt-4 flex items-center gap-2">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full rounded-full border border-gray-200 bg-white pl-6 pr-12 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        if (!isRecording) setLastContent(e.target.value);
                    }}
                    disabled={disabled}
                />
                <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full transition-all",
                        isRecording ? "bg-red-100 text-red-600 animate-pulse" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    )}
                    disabled={disabled}
                    title={isRecording ? "Stop Recording" : "Start Voice Input"}
                >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
            </div>
            <Button
                type="submit"
                disabled={disabled || !content.trim()}
                className="h-12 w-12 rounded-full p-0 flex items-center justify-center shrink-0"
            >
                {disabled ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                    <span>↗️</span>
                )}
            </Button>
        </form>
    );
}
