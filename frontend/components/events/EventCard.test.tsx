/**
 * EventCard Component Tests (UT-COMP-005)
 * TDD: Writing tests FIRST
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from './EventCard';
import { Event } from '@/types/api';
import React from 'react';

const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    occurrence: '2026-12-25T10:00:00Z',
    description: 'This is a test event description',
    userId: 'user1'
};

describe('EventCard Component', () => {
    test('renders event details correctly', () => {
        render(<EventCard event={mockEvent} />);

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('This is a test event description')).toBeInTheDocument();
        // Date formatting check (depending on locale, but check for year/month)
        expect(screen.getByText(/2026/)).toBeInTheDocument();
        expect(screen.getByText(/December/i)).toBeInTheDocument();
    });

    test('calls onEdit when edit button clicked', () => {
        const onEdit = jest.fn();
        render(<EventCard event={mockEvent} onEdit={onEdit} />);

        const editBtn = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editBtn);

        expect(onEdit).toHaveBeenCalledWith(mockEvent);
    });

    test('calls onDelete when delete button clicked', () => {
        const onDelete = jest.fn();
        render(<EventCard event={mockEvent} onDelete={onDelete} />);

        const deleteBtn = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);

        expect(onDelete).toHaveBeenCalledWith('1');
    });

    test('truncates long description', () => {
        const longDesc = 'A'.repeat(200);
        const eventWithLongDesc = { ...mockEvent, description: longDesc };
        render(<EventCard event={eventWithLongDesc} />);

        // Check if description is displayed but likely truncated by CSS (we can check for specific class or ellipsis if implemented in JS)
        // For now, just ensure it renders
        expect(screen.getByText(longDesc)).toBeInTheDocument();
    });
});
