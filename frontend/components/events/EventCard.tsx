/**
 * EventCard Component (UT-COMP-005)
 * Displays event information with action buttons
 */

import React from 'react';
import { Event } from '@/types/api';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

interface EventCardProps {
    event: Event;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
}

/**
 * EventCard Component
 * 
 * Implements REQ-EVENT-002: Event Display
 * Displays individual event details with action (Edit/Delete) buttons.
 * 
 * Features:
 * - Truncated description for better UI layout (REQ-UI-006)
 * - Conditional rendering of actions based on user permissions (REQ-SEC-002) - (Currently simplistic check)
 * - visual indicators for event timing.
 * 
 * Tested by: `frontend/components/events/EventCard.test.tsx`
 */
export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
    // REQ-UI-006: Description truncation logic (line-clamp utilized in CSS)
    const formattedDate = format(new Date(event.occurrence), 'PPP p');

    return (
        <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm font-medium text-blue-600">{formattedDate}</p>
                </div>
            </div>

            <div className="flex-grow">
                <p className="text-gray-600 line-clamp-3">
                    {event.description || 'No description provided.'}
                </p>
            </div>

            <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4">
                {onEdit && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(event)}
                        aria-label="Edit event"
                    >
                        Edit
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(event.id)}
                        aria-label="Delete event"
                    >
                        Delete
                    </Button>
                )}
            </div>
        </div>
    );
}

// Add CSS for line-clamp if not standard in tailwind version (it is in v3/v4 usually)
