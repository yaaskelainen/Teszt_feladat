/**
 * API Client Implementation using Axios
 * 
 * Handles:
 * - Base configuration
 * - Request interception (adding tokens)
 * - Response interception (error handling, token refresh)
 * - Token management
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { handleApiError } from '../utils/errors';
import { AuthResponse } from '@/types/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'event_manager_access_token';
const REFRESH_TOKEN_KEY = 'event_manager_refresh_token';

// Create base instance
export const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies if using HTTP-only cookies
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });

    failedQueue = [];
};

// --- Token Management Helpers ---

export const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
};

export const getRefreshToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
};

export const setAccessToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
};

export const setRefreshToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
};

export const setTokens = (tokens: AuthResponse) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
};

export const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};

// --- Interceptors ---

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 & Errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized (Token Expiry)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                // No refresh token, clear everything and redirect to login
                clearTokens();
                isRefreshing = false;
                // Since this is a library, strictly we shouldn't redirect directly
                // but let the caller handle it or use an event bus.
                // For simplicity in this implementation, we reject.
                return Promise.reject(handleApiError(error));
            }

            try {
                // Attempt to refresh token directly via axios (bypass interceptors to avoid loop)
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                setAccessToken(accessToken);
                setRefreshToken(newRefreshToken); // Update refresh token if rotated

                processQueue(null, accessToken);

                // Update original request header
                originalRequest.headers.Authorization = 'Bearer ' + accessToken;
                isRefreshing = false;

                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                isRefreshing = false;
                return Promise.reject(handleApiError(refreshError));
            }
        }

        // Return standardized error response
        return Promise.reject(handleApiError(error));
    }
);
