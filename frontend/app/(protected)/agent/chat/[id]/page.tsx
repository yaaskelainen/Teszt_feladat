'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Send, User, Bot, ShieldCheck } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    senderId: string;
    senderRole: 'USER' | 'AGENT';
    createdAt: string;
    isHumanRequired: boolean;
}

export default function AgentChatPage() {
    const { id: chatId } = useParams();
    const router = useRouter();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [reply, setReply] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSending, setIsSending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchHistory = React.useCallback(async () => {
        try {
            const response = await apiClient.get<Message[]>(`/helpdesk/history/${chatId}`);
            setMessages(response.data);
            setError(null);
        } catch (err) {
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
        } finally {
            setIsLoading(false);
        }
    }, [chatId]);

    React.useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000); // Pool every 5s
        return () => clearInterval(interval);
    }, [fetchHistory]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setIsSending(true);
        try {
            await apiClient.post(`/helpdesk/reply`, {
                userId: chatId, // ChatId is the userId in this simplified system
                content: reply
            });
            setReply('');
            fetchHistory();
        } catch (err) {
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/agent')} className="p-2 h-auto">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Chat with {String(chatId).split('-')[0]}
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                        </h1>
                        <p className="text-xs text-gray-500">Managing takeover from AI Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    Secure Channel
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 italic">
                    {error}
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto space-y-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm mb-6">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${m.senderRole === 'USER' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`flex gap-3 max-w-[80%] ${m.senderRole === 'USER' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.senderRole === 'USER' ? 'bg-amber-100 text-amber-600' :
                                    m.senderId === 'AI_BOT' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                }`}>
                                {m.senderRole === 'USER' ? <User size={16} /> : m.senderId === 'AI_BOT' ? <Bot size={16} /> : <div className="text-[10px] font-bold">AG</div>}
                            </div>
                            <div>
                                <div className={`px-4 py-2 rounded-2xl text-sm ${m.senderRole === 'USER'
                                        ? 'bg-gray-100 text-gray-900 rounded-tl-none'
                                        : m.senderId === 'AI_BOT'
                                            ? 'bg-indigo-50 text-indigo-900 rounded-tr-none border border-indigo-100'
                                            : 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                                    }`}>
                                    {m.content}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 px-1">
                                    {new Date(m.createdAt).toLocaleTimeString()} {m.senderId === 'AI_BOT' ? '(AI Assistant)' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply Area */}
            <form onSubmit={handleSend} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl flex gap-3">
                <div className="flex-grow">
                    <Input
                        placeholder="Type your response to the user..."
                        className="border-none bg-gray-50 focus:ring-0 rounded-2xl h-12"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        disabled={isSending}
                    />
                </div>
                <Button type="submit" className="px-6 h-12 rounded-2xl gap-2" isLoading={isSending}>
                    <Send size={18} />
                    Send
                </Button>
            </form>
        </div>
    );
}
