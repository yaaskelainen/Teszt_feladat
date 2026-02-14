/**
 * EventList Component Tests (UT-COMP-007)
 * TDD: Writing tests FIRST
 */
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { EventList } from '@/components/events/EventList';
import { Event } from '@/types/api';

const mockEvents: Event[] = [
    { id: '1', title: 'Event 1', occurrence: '2026-12-25T10:00:00Z', userId: 'u1' },
    { id: '2', title: 'Event 2', occurrence: '2026-12-26T10:00:00Z', userId: 'u1' },
];

describe('EventList Component', () => {
    test('renders list of events', () => {
        render(<EventList events={mockEvents} />);

        expect(screen.getByText('Event 1')).toBeInTheDocument();
        expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    test('renders empty state message', () => {
        render(<EventList events={[]} />);

        expect(screen.getByText(/no events found/i)).toBeInTheDocument();
    });

    test('renders loading state', () => {
        render(<EventList events={[]} isLoading={true} />);

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    });
});
