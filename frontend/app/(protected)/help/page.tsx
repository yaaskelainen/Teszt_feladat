'use client';

import React from 'react';
import { useChat } from '@/lib/hooks/useChat';
import { ChatWindow } from '@/components/help/ChatWindow';
import { ChatInput } from '@/components/help/ChatInput';

export default function HelpPage() {
    const { messages, isLoading, isSending, error, sendMessage, clearError } = useChat();

    const handleSend = async (content: string) => {
        await sendMessage(content);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Help Desk</h1>
                <p className="mt-2 text-gray-600">
                    Get instant support for your event management needs from our intelligent assistant.
                </p>
            </div>

            <div className="relative rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full px-12">
                        <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800 shadow-sm border border-red-100">
                            <span>{error}</span>
                            <button onClick={clearError} className="ml-4 font-bold">×</button>
                        </div>
                    </div>
                )}

                <ChatWindow
                    messages={messages}
                    isLoading={isLoading}
                    isSending={isSending}
                />

                <ChatInput
                    onSend={handleSend}
                    disabled={isSending}
                />

                <p className="mt-4 text-center text-[10px] text-gray-400">
                    AI responses may sometimes be inaccurate. Support agents are available for complex queries.
                </p>
            </div>

            <section className="grid gap-6 md:grid-cols-3">
                {[
                    { q: 'How to create an event?', a: 'Click the "Create Event" button on the Events dashboard.' },
                    { q: 'Can I edit events?', a: 'Yes, but only the description field is editable after creation.' },
                    { q: 'Is my data secure?', a: 'All actions are audited and protected by RBAC and JWT.' },
                ].map((faq, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-blue-100 transition-colors">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">{faq.q}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
