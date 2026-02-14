/**
 * Error Handler Utility
 * Implementation to make tests pass (TDD GREEN phase)
 */

import { AxiosError } from 'axios';

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    GENERIC: 'An unexpected error occurred. Please try again.',
};

interface ApiErrorResponse {
    userMessage: string;
    statusCode?: number;
    originalError?: unknown;
}

/**
 * Check if error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError;
        return axiosError.request !== undefined && axiosError.response === undefined;
    }
    return false;
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): string {
    // Network errors
    if (isNetworkError(error)) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Axios errors with response
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as AxiosError<{ message?: string | string[]; errors?: string[] }>;
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        switch (status) {
            case 401:
                return ERROR_MESSAGES.UNAUTHORIZED;
            case 403:
                return ERROR_MESSAGES.FORBIDDEN;
            case 404:
                return ERROR_MESSAGES.NOT_FOUND;
            case 429:
                return ERROR_MESSAGES.RATE_LIMIT;
            case 500:
            case 502:
            case 503:
            case 504:
                return ERROR_MESSAGES.SERVER_ERROR;
            case 400:
                // Validation errors
                if (data?.message) {
                    if (Array.isArray(data.message)) {
                        return data.message.join(', ');
                    }
                    return data.message;
                }
                if (data?.errors) {
                    return data.errors.join(', ');
                }
                return ERROR_MESSAGES.VALIDATION_ERROR;
            default:
                if (data?.message) {
                    return Array.isArray(data.message) ? data.message.join(', ') : data.message;
                }
                return ERROR_MESSAGES.GENERIC;
        }
    }

    // Generic errors
    if (error instanceof Error) {
        return error.message || ERROR_MESSAGES.GENERIC;
    }

    return ERROR_MESSAGES.GENERIC;
}

/**
 * Handle API errors and return structured error response
 */
export function handleApiError(error: unknown): ApiErrorResponse {
    const userMessage = getErrorMessage(error);

    let statusCode: number | undefined;
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as AxiosError;
        statusCode = axiosError.response?.status;
    }

    return {
        userMessage,
        statusCode,
        originalError: error,
    };
}

/**
 * Log error to console in development
 */
export function logError(error: unknown, context?: string): void {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
    }
}
