/**
 * EventList Component (UT-COMP-007)
 * Renders a grid of EventCard components
 */

import React from 'react';
import { Event } from '@/types/api';
import { EventCard } from './EventCard';

interface EventListProps {
    events: Event[];
    isLoading?: boolean;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
}

/**
 * EventList Component
 * 
 * Implements REQ-EVENT-001: Event Dashboard
 * Displays a grid of events and handles empty/loading states.
 * 
 * Features:
 * - Responsive grid layout (REQ-UI-007)
 * - Loading skeletons/spinners (REQ-UI-003)
 * - Empty state feedback (REQ-UX-005)
 * 
 * Tested by: `frontend/components/events/EventList.test.tsx`
 */
export function EventList({ events, isLoading = false, onEdit, onDelete }: EventListProps) {
    // REQ-UI-003: Loading State
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-lg text-gray-500 animate-pulse">Loading events...</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
                <p className="text-xl font-semibold text-gray-900">No events found</p>
                <p className="mt-1 text-gray-500">Get started by creating your first event.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    event={event}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
