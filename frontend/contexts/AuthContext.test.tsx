/**
 * Auth Context Tests (UT-HOOK-001)
 * TDD: Writing tests FIRST
 */

import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
const { AuthProvider, useAuth } = jest.requireActual('./AuthContext') as any;
// Use real implementation, which we will spy on
import { apiClient } from '@/lib/api/client';

// Helper component
const TestComponent = () => {
    const { user, isLoading, login, logout, isAuthenticated } = useAuth();
    return (
        <div>
            <div data-testid="loading">{isLoading.toString()}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="user-email">{user?.email || 'none'}</div>
            <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

// Mock LocalStorage explicitly
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockClear = jest.fn();

Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: mockRemoveItem,
        clear: mockClear,
    },
    writable: true,
});

describe('AuthContext', () => {
    let mockPost: any;
    let mockGet: any;

    beforeAll(() => {
        // Spy on apiClient methods
        mockPost = jest.spyOn(apiClient, 'post' as any);
        mockGet = jest.spyOn(apiClient, 'get' as any);
    });

    afterAll(() => {
        mockPost.mockRestore();
        mockGet.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mock implementation
        mockPost.mockResolvedValue({
            data: { accessToken: 'access-token', refreshToken: 'refresh-token' }
        });
        mockGet.mockResolvedValue({
            data: { id: 'user-1', email: 'test@example.com', roles: ['USER'] }
        });
        mockGetItem.mockReturnValue(null); // Default: no token
    });

    test('should provide initial state and handle login', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for loading to finish
        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

        // Perform login
        const loginBtn = screen.getByText('Login');
        fireEvent.click(loginBtn);

        // Verify calls and state update
        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                email: 'test@example.com',
                password: 'password'
            });
            expect(mockGet).toHaveBeenCalledWith('/users/me');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
            expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        });

        // Verify tokens saved to localStorage
        expect(mockSetItem).toHaveBeenCalledWith('event_manager_access_token', 'access-token');
        expect(mockSetItem).toHaveBeenCalledWith('event_manager_refresh_token', 'refresh-token');
    });

    test('should clear state on logout', async () => {
        // Setup: mocking token presence for auto-login
        mockGetItem.mockReturnValue('valid-token');

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for profile fetch AND state update
        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith('/users/me');
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        });

        // Logout
        const logoutBtn = screen.getByText('Logout');
        fireEvent.click(logoutBtn);

        // Check logout
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-email')).toHaveTextContent('none');

        // Verify clear tokens
        expect(mockRemoveItem).toHaveBeenCalledWith('event_manager_access_token');
        expect(mockRemoveItem).toHaveBeenCalledWith('event_manager_refresh_token');
    });
});
