'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { User, AdminCreateUserDto, CreateUserResponse } from '@/types/api';
import { handleApiError } from '../utils/errors';

/**
 * useAdmin Hook
 * 
 * Centralizes logic for Admin Panel operations (REQ-ADMIN-LOGIC).
 * 
 * Capabilities:
 * - Fetch Users (REQ-ADMIN-003): Retrieves user list from `/admin/users`
 * - Provision User (REQ-ADMIN-001): POSTs new user data to `/admin/users`
 * 
 * Encapsulates error handling (REQ-ERR-001) and loading states.
 */
export function useAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // REQ-ADMIN-003: Load initial user list
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // This endpoint might not exist yet based on some documents, 
            // but we'll implement it as per the mapping.
            const response = await apiClient.get<User[]>('/admin/users');
            setUsers(response.data);
        } catch (err: any) {
            setError(handleApiError(err).userMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const provisionUser = useCallback(async (data: AdminCreateUserDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.post<CreateUserResponse>('/admin/users', data);

            // Safety check: Ensure backend returned the expected structure
            if (response.data && response.data.user) {
                setUsers(prev => [...prev, response.data.user]);
            }

            return response.data;
        } catch (err: any) {
            setError(handleApiError(err).userMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        isLoading,
        error,
        provisionUser,
        refreshUsers: fetchUsers
    };
}
