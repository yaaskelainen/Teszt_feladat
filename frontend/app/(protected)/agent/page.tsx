'use client';

import React from 'react';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errors';
import { Button } from '@/components/ui/Button';
import { MessageSquare, User, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface ChatQueueItem {
    chatId: string;
    lastMessage: string;
    senderId: string;
    isHumanRequired: boolean;
    timestamp?: string;
}

export default function AgentDashboard() {
    const [queue, setQueue] = React.useState<ChatQueueItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchQueue = React.useCallback(async () => {
        try {
            const response = await apiClient.get<ChatQueueItem[]>('/helpdesk/queue');
            setQueue(response.data);
            setError(null);
        } catch (err) {
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchQueue]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    const humanRequiredCount = queue.filter(q => q.isHumanRequired).length;

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Agent Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Manage all active customer support requests.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{humanRequiredCount}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Priority Chats</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{queue.length}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 italic">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                        Active Chat Queue
                    </h2>
                </div>
                <ul className="divide-y divide-gray-100">
                    {queue.length === 0 ? (
                        <li className="p-20 text-center">
                            <div className="mx-auto h-20 w-20 text-gray-200 mb-4">
                                <CheckCircle2 className="h-full w-full" />
                            </div>
                            <p className="text-gray-500 font-medium">No active chats in the queue. You're all caught up!</p>
                        </li>
                    ) : (
                        queue.map((item) => (
                            <li key={item.chatId} className={`hover:bg-gray-50 transition-colors p-6 ${item.isHumanRequired ? 'bg-amber-50/30' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.isHumanRequired ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900">User: {item.senderId.split('-')[0]}</h4>
                                                {item.isHumanRequired && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                                                        Human Needed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-1 mt-1 max-w-xl">
                                                {item.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant={item.isHumanRequired ? 'primary' : 'secondary'}
                                            onClick={() => window.location.href = `/agent/chat/${item.chatId}`}
                                        >
                                            Take Chat
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
