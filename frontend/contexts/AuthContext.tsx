'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginDto } from '@/types/api';
import { apiClient, setTokens, clearTokens, getAccessToken } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errors';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    mfaRequired: boolean;
    login: (credentials: LoginDto) => Promise<{ mfaRequired: boolean }>;
    verifyMfa: (code: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Initial check for token
    useEffect(() => {
        const checkAuth = async () => {
            const token = getAccessToken();
            if (token) {
                try {
                    // Fetch user profile
                    const response = await apiClient.get<User>('/users/me');
                    setUser(response.data);
                } catch (err) {
                    // Token invalid or expired
                    clearTokens();
                    setUser(null);
                }
            }
            setIsLoading(false);
            setInitialCheckDone(true);
        };

        checkAuth();
    }, []);

    const login = useCallback(async (credentials: LoginDto) => {
        setIsLoading(true);
        setError(null);
        setMfaRequired(false);
        try {
            const response = await apiClient.post('/auth/login', credentials);

            if (response.data.mfaRequired) {
                setMfaRequired(true);
                setPendingUserId(response.data.userId);
                return { mfaRequired: true };
            }

            const { accessToken, refreshToken } = response.data;
            setTokens({ accessToken, refreshToken });

            // Fetch user profile immediately after login
            const userResponse = await apiClient.get<User>('/users/me');
            setUser(userResponse.data);
            return { mfaRequired: false };
        } catch (err) {
            const errorResponse = handleApiError(err);
            setError(errorResponse.userMessage);
            throw err; // Re-throw to allow component handling
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyMfa = useCallback(async (code: string) => {
        if (!pendingUserId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/auth/mfa/verify', { userId: pendingUserId, code });
            const { accessToken, refreshToken } = response.data;

            setTokens({ accessToken, refreshToken });
            const userResponse = await apiClient.get<User>('/users/me');
            setUser(userResponse.data);
            setMfaRequired(false);
            setPendingUserId(null);
        } catch (err) {
            const errorResponse = handleApiError(err);
            setError(errorResponse.userMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [pendingUserId]);

    const logout = useCallback(() => {
        clearTokens();
        setUser(null);
        setMfaRequired(false);
        setPendingUserId(null);
        // Optionally redirect here or let router handle it
    }, []);

    const value = {
        user,
        isLoading,
        error,
        mfaRequired,
        login,
        verifyMfa,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
