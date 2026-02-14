import { render, screen, act } from '@testing-library/react';

import React from 'react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './Toast';

// Fix for Jest timers


const TestComponent = () => {
    const { addToast } = useToast();
    return (
        <div>
            <button onClick={() => addToast('Success message', 'success')}>Show Success</button>
            <button onClick={() => addToast('Error message', 'error')}>Show Error</button>
        </div>
    );
};

describe('Toast Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    test('renders nothing initially', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('shows toast when triggered', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        await user.click(screen.getByText('Show Success'));

        expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    test('removes toast after duration', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        await user.click(screen.getByText('Show Success'));
        expect(screen.getByText('Success message')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(3500);
        });

        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    test('can be dismissed manually', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        await user.click(screen.getByText('Show Error'));

        // Look for the close button specifically within the alert
        const closeButton = screen.getByRole('button', { name: /close/i });

        await user.click(closeButton);

        expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
});
