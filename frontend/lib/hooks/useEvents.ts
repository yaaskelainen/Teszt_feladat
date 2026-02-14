/**
 * useEvents Hook (UT-HOOK-002)
 * Handles Event CRUD operations via API client
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { Event, CreateEventDto, UpdateEventDto } from '@/types/api';
import { handleApiError } from '../utils/errors';

/**
 * useEvents Hook
 * 
 * Centralizes logic for Event Management (REQ-EVENT-LOGIC).
 * 
 * Capabilities:
 * - CRUD Operations (REQ-EVENT-003): Create, Read, Update, Delete events.
 * - State Management: Handles loading, error, and data states.
 * - API Integration: Connects to `/events` endpoints.
 * 
 * Tested by: `frontend/lib/hooks/useEvents.test.ts`
 */
export function useEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<Event[]>('/events');
            setEvents(response.data);
        } catch (err: any) {
            setError(handleApiError(err).userMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createEvent = useCallback(async (data: CreateEventDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.post<Event>('/events', data);
            setEvents((prev) => [...prev, response.data]);
        } catch (err: any) {
            setError(handleApiError(err).userMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateEvent = useCallback(async (id: string, data: UpdateEventDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.patch<Event>(`/events/${id}`, data);
            setEvents((prev) =>
                prev.map((evt) => (evt.id === id ? { ...evt, ...response.data } : evt))
            );
        } catch (err: any) {
            setError(handleApiError(err).userMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteEvent = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.delete(`/events/${id}`);
            setEvents((prev) => prev.filter((evt) => evt.id !== id));
        } catch (err: any) {
            setError(handleApiError(err).userMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        events,
        isLoading,
        error,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
    };
}
