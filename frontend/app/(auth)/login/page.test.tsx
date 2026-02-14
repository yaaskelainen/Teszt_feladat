/**
 * Login Page Integration Tests (INT-auth-001)
 * TDD: Writing tests FIRST
 */
/// <reference types="@testing-library/jest-dom" />

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
// Mock dependencies with alias
// Global mock in jest.setup.js handles AuthContext

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe('Login Page', () => {
    const mockLogin = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseAuth.mockReturnValue({
            user: null,
            login: mockLogin,
            logout: jest.fn(),
            verifyMfa: jest.fn(),
            mfaRequired: false,
            isLoading: false,
            error: null,
            isAuthenticated: false
        } as any);
        mockedUseRouter.mockReturnValue({
            push: mockPush,
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
        } as any);
    });

    test('renders login form', () => {
        render(<LoginPage />);
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    test('handles successful login', async () => {
        mockLogin.mockResolvedValue({ mfaRequired: false }); // Success

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'user@example.com',
                password: 'password123'
            });
        });

        // Should redirect
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/events');
        });
    });

    test('displays error provided by context', () => {
        // Evaluate state display independently from interaction
        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
            isLoading: false,
            error: 'Invalid credentials provided', // Context already has error
            isAuthenticated: false
        });

        render(<LoginPage />);

        expect(screen.getByText('Invalid credentials provided')).toBeInTheDocument();
    });

    test('validates input fields', async () => {
        render(<LoginPage />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Validation errors should appear
        await waitFor(() => {
            expect(mockLogin).not.toHaveBeenCalled();
            // Check for error text if implemented in Input component
            // Or assume validation prevented submission
        });
    });
});
