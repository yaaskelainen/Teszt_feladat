import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';
import React from 'react';

jest.mock('@/lib/hooks/useSpeechToText', () => ({
    useSpeechToText: () => ({
        isRecording: false,
        transcript: '',
        startRecording: jest.fn(),
        stopRecording: jest.fn(),
    }),
}));

describe('ChatInput Component', () => {
    test('renders input and buttons', () => {
        render(<ChatInput onSend={jest.fn()} disabled={false} />);

        expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
        // Now there are two buttons: Mic and Send
        expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    test('calls onSend with input value when submitted', async () => {
        const onSendMock = jest.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(<ChatInput onSend={onSendMock} disabled={false} />);

        const input = screen.getByPlaceholderText(/type your message/i);
        await user.type(input, 'Hello World');

        const button = screen.getByRole('button', { name: /↗️/ });
        await user.click(button);

        expect(onSendMock).toHaveBeenCalledWith('Hello World');
    });

    test('clears input after successful send', async () => {
        const onSendMock = jest.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(<ChatInput onSend={onSendMock} disabled={false} />);

        const input = screen.getByPlaceholderText(/type your message/i);
        await user.type(input, 'Test Message');
        await user.click(screen.getByRole('button', { name: /↗️/ }));

        await waitFor(() => {
            expect(input).toHaveValue('');
        });
    });

    test('disables input and button when disabled prop is true', () => {
        render(<ChatInput onSend={jest.fn()} disabled={true} />);

        const input = screen.getByPlaceholderText(/type your message/i);
        const buttons = screen.getAllByRole('button');

        expect(input).toBeDisabled();
        buttons.forEach(button => expect(button).toBeDisabled());
    });

    test('does not send empty messages', async () => {
        const onSendMock = jest.fn();
        const user = userEvent.setup();

        render(<ChatInput onSend={onSendMock} disabled={false} />);

        const button = screen.getByRole('button', { name: /↗️/ });
        await user.click(button);

        expect(onSendMock).not.toHaveBeenCalled();
    });
});
