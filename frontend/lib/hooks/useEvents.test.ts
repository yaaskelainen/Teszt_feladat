/**
 * useEvents Hook Tests (UT-HOOK-002)
 * TDD: Writing tests FIRST
 */
/// <reference types="@testing-library/jest-dom" />

import { renderHook, act, waitFor } from '@testing-library/react';
import { useEvents } from './useEvents';
import { apiClient } from '@/lib/api/client';

// Mock apiClient
jest.mock('@/lib/api/client', () => ({
    apiClient: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    }
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useEvents Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch events on initial load', async () => {
        const mockEvents = [
            { id: '1', title: 'Event 1', occurrence: '2026-12-25T10:00:00Z', userId: 'user1' },
            { id: '2', title: 'Event 2', occurrence: '2026-12-26T10:00:00Z', userId: 'user1' },
        ];
        (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockEvents });

        const { result } = renderHook(() => useEvents());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.events).toEqual(mockEvents);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/events');
    });

    test('should create a new event', async () => {
        const newEventData = { title: 'New Event', occurrence: '2026-12-27T10:00:00Z', description: 'Test' };
        const createdEvent = { id: '3', ...newEventData, userId: 'user1' };

        // Initial fetch setup
        (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: [] });
        (mockedApiClient.post as jest.Mock).mockResolvedValue({ data: createdEvent });

        const { result } = renderHook(() => useEvents());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.createEvent(newEventData);
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/events', newEventData);
        expect(result.current.events).toContainEqual(createdEvent);
    });

    test('should handle update error', async () => {
        (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: [] });
        (mockedApiClient.patch as jest.Mock).mockRejectedValue(new Error('Update failed'));

        const { result } = renderHook(() => useEvents());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            try {
                await result.current.updateEvent('1', { description: 'Updated' });
            } catch (err) {
                // Expected
            }
        });

        expect(result.current.error).toBeDefined();
    });

    test('should delete an event', async () => {
        const mockEvents = [{ id: '1', title: 'Event 1', occurrence: '2026-12-25T10:00:00Z', userId: 'user1' }];
        (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockEvents });
        (mockedApiClient.delete as jest.Mock).mockResolvedValue({});

        const { result } = renderHook(() => useEvents());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.deleteEvent('1');
        });

        expect(mockedApiClient.delete).toHaveBeenCalledWith('/events/1');
        expect(result.current.events).toHaveLength(0);
    });
});
