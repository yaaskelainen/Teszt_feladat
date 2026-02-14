import { render, screen } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';
import { ChatMessage } from '@/types/api';
import React from 'react';

// Create a mock for scrollIntoView since jsdom doesn't implement it
const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

// Mock react-markdown because it's ESM only and causes issues in Jest
jest.mock('react-markdown', () => {
    return function MockMarkdown({ children }: { children: React.ReactNode }) {
        return <div data-testid="markdown">{children}</div>;
    };
});

const mockMessages: ChatMessage[] = [
    { id: '1', content: 'Hello AI', role: 'USER', userId: 'u1', createdAt: '2023-01-01T10:00:00Z' },
    { id: '2', content: 'Hello User', role: 'AI', userId: 'ai', createdAt: '2023-01-01T10:00:05Z' }
];

describe('ChatWindow Component', () => {
    test('renders loading state', () => {
        render(<ChatWindow messages={[]} isLoading={true} />);
        expect(screen.getByText(/connecting to ai support/i)).toBeInTheDocument();
    });

    test('renders empty state', () => {
        render(<ChatWindow messages={[]} isLoading={false} />);
        expect(screen.getByText(/how can i help you today/i)).toBeInTheDocument();
    });

    test('renders messages correctly', () => {
        render(<ChatWindow messages={mockMessages} isLoading={false} />);

        expect(screen.getByText('Hello AI')).toBeInTheDocument();
        expect(screen.getByText('Hello User')).toBeInTheDocument();
    });

    test('renders user messages on the right', () => {
        render(<ChatWindow messages={mockMessages} isLoading={false} />);

        // Use a more robust check for alignment classes
        const userMsg = screen.getByText('Hello AI');
        // The message content is wrapped in a div with justify-end class in the parent
        const messageContainer = userMsg.closest('.flex.justify-end');
        expect(messageContainer).toBeInTheDocument();

        const aiMsg = screen.getByText('Hello User');
        const aiMessageContainer = aiMsg.closest('.flex.justify-start');
        expect(aiMessageContainer).toBeInTheDocument();
    });
});
