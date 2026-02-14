/**
 * API Client Tests (UT-UTIL-001)
 * TDD: Writing tests FIRST
 */

// Use global jest, describe, test, etc.

// Define spies to track calls
const mockRequestUse = jest.fn();
const mockResponseUse = jest.fn();

// Define the mock axios instance structure
const mockAxiosInstance = {
    defaults: {
        baseURL: '',
        headers: {
            common: {
                'Content-Type': ''
            }
        }
    },
    interceptors: {
        request: { use: mockRequestUse, eject: jest.fn() },
        response: { use: mockResponseUse, eject: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
};

// Mock axios module factory
jest.mock('axios', () => {
    return {
        __esModule: true, // Needed for ES modules
        default: {
            create: jest.fn(() => mockAxiosInstance),
            post: jest.fn(),
        },
        create: jest.fn(() => mockAxiosInstance),
    };
});

describe('API Client Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules(); // Ensure clean state
    });

    test('should act as a singleton instance and setup interceptors', async () => {
        // Isolate the module for this test
        const clientModule = await import('./client');
        const { apiClient } = clientModule;

        // Verify it matches our mock structure
        expect(apiClient.defaults).toBeDefined();

        // Check if interceptors were attached
        // Note: import triggers the code execution
        expect(mockRequestUse).toHaveBeenCalled();
        expect(mockResponseUse).toHaveBeenCalled();
    });
});

describe('Token Management', () => {
    let clientModule: any;

    beforeEach(async () => {
        jest.resetModules(); // Reset to get fresh state
        // Re-mock axios if needed or rely on hoisted mock
        // We need to re-import client to test its exports
        clientModule = await import('./client');
        clientModule.clearTokens();
    });

    test('should set and get access token', () => {
        const token = 'test-token-123';
        clientModule.setAccessToken(token);
        expect(clientModule.getAccessToken()).toBe(token);
    });

    test('should clear tokens', () => {
        clientModule.setAccessToken('test-token');
        clientModule.clearTokens();
        expect(clientModule.getAccessToken()).toBeNull();
    });
});
