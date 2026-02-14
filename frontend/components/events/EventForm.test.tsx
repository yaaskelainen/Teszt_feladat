/**
 * EventForm Component Tests (UT-COMP-006)
 * TDD: Writing tests FIRST
 */
/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventForm } from '@/components/events/EventForm';
import { CreateEventDto } from '@/types/api';

jest.mock('@/lib/hooks/useSpeechToText', () => ({
    useSpeechToText: () => ({
        isRecording: false,
        transcript: '',
        startRecording: jest.fn(),
        stopRecording: jest.fn(),
    }),
}));

describe('EventForm Component', () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders create form correctly', () => {
        render(<EventForm onSubmit={mockOnSubmit} />);

        expect(screen.getByRole('heading', { name: /create event/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date and time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
    });

    test('submits valid data', async () => {
        render(<EventForm onSubmit={mockOnSubmit} />);

        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Event' } });
        fireEvent.change(screen.getByLabelText(/date and time/i), { target: { value: '2026-12-25T10:00' } });
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Event Description' } });

        fireEvent.click(screen.getByRole('button', { name: /create event/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                title: 'New Event',
                occurrence: expect.stringContaining('2026-12-25'),
                description: 'Event Description'
            });
        });
    });

    test('validates required fields', async () => {
        render(<EventForm onSubmit={mockOnSubmit} />);

        fireEvent.click(screen.getByRole('button', { name: /create event/i }));

        await waitFor(() => {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument();
            expect(screen.getByText(/date and time are required/i)).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('loads initial data for editing', () => {
        const initialData = {
            title: 'Existing Event',
            occurrence: '2026-12-25T10:00:00Z',
            description: 'Existing Description'
        };

        render(<EventForm onSubmit={mockOnSubmit} initialData={initialData} isEditing={true} />);

        expect(screen.getByRole('heading', { name: /edit event/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Event');
        expect(screen.getByLabelText(/description/i)).toHaveValue('Existing Description');
        expect(screen.getByRole('button', { name: /update event/i })).toBeInTheDocument();
    });
});
