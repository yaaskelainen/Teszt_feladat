/**
 * Error Handler Tests (UT-UTIL-004)
 * TDD: Writing tests FIRST
 */

// Use global describe, test, expect
import {
    getErrorMessage,
    isNetworkError,
    handleApiError,
    ERROR_MESSAGES,
} from './errors';

describe('Error Message Mapping', () => {
    test('should return unauthorized message for 401 status', () => {
        const error = {
            response: {
                status: 401,
                data: { message: 'Unauthorized' },
            },
        };

        const message = getErrorMessage(error);
        expect(message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    test('should return forbidden message for 403 status', () => {
        const error = {
            response: {
                status: 403,
                data: { message: 'Forbidden' },
            },
        };

        const message = getErrorMessage(error);
        expect(message).toBe(ERROR_MESSAGES.FORBIDDEN);
    });

    test('should return not found message for 404 status', () => {
        const error = {
            response: {
                status: 404,
                data: { message: 'Not Found' },
            },
        };

        const message = getErrorMessage(error);
        expect(message).toBe(ERROR_MESSAGES.NOT_FOUND);
    });

    test('should return rate limit message for 429 status', () => {
        const error = {
            response: {
                status: 429,
                data: { message: 'Too Many Requests' },
            },
        };

        const message = getErrorMessage(error);
        expect(message).toBe(ERROR_MESSAGES.RATE_LIMIT);
    });

    test('should return server error message for 500 status', () => {
        const error = {
            response: {
                status: 500,
                data: { message: 'Internal Server Error' },
            },
        };

        const message = getErrorMessage(error);
        expect(message).toBe(ERROR_MESSAGES.SERVER_ERROR);
    });

    test('should return validation error message for 400 with validation errors', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    message: 'Validation failed',
                    errors: ['Field required'],
                },
            },
        };

        const message = getErrorMessage(error);
        expect(message).toContain('Validation failed');
    });

    test('should return network error message for no response', () => {
        const error = {
            request: {},
            message: 'Network Error',
        };

        const message = getErrorMessage(error);
        expect(message).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    test('should return error message for standard Error objects', () => {
        const error = new Error('Unknown error');

        const message = getErrorMessage(error);
        expect(message).toBe('Unknown error');
    });
});

describe('Network Error Detection', () => {
    test('should detect network error from missing response', () => {
        const error = {
            request: {},
            message: 'Network Error',
        };

        expect(isNetworkError(error)).toBe(true);
    });

    test('should not detect network error when response exists', () => {
        const error = {
            response: {
                status: 500,
            },
        };

        expect(isNetworkError(error)).toBe(false);
    });
});

describe('API Error Handling', () => {
    test('should extract error message from response data', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    message: 'Custom error message',
                },
            },
        };

        const result = handleApiError(error);
        expect(result.userMessage).toContain('Custom error message');
        expect(result.statusCode).toBe(400);
    });

    test('should handle array of error messages', () => {
        const error = {
            response: {
                status: 400,
                data: {
                    message: ['Error 1', 'Error 2'],
                },
            },
        };

        const result = handleApiError(error);
        expect(result.userMessage).toContain('Error 1');
        expect(result.userMessage).toContain('Error 2');
    });
});
