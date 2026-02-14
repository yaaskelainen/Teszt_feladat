/**
 * AdminPage Integration Tests (Phase 5)
 * TDD: Logic verification before marking complete
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from './page';
// We need to mock the hook properly
import * as useAdminHook from '@/lib/hooks/useAdmin';
import React from 'react';

// Mock the hook
jest.mock('@/lib/hooks/useAdmin');

// Mock child components to avoid testing their internals again
jest.mock('@/components/admin/UserList', () => ({
    UserList: ({ users }: any) => <div data-testid="user-list">Users Count: {users.length}</div>
}));

jest.mock('@/components/admin/AdminUserForm', () => ({
    AdminUserForm: ({ onSubmit }: any) => (
        <button onClick={() => onSubmit({ email: 'new@example.com', roles: ['USER'] })}>
            Mock Submit Form
        </button>
    )
}));

jest.mock('@/components/ui/Modal', () => ({
    Modal: ({ isOpen, children }: any) => isOpen ? <div role="dialog">{children}</div> : null
}));

describe('AdminPage Integration', () => {
    const mockProvisionUser = jest.fn();

    beforeEach(() => {
        (useAdminHook.useAdmin as jest.Mock).mockReturnValue({
            users: [],
            isLoading: false,
            error: null,
            provisionUser: mockProvisionUser
        });
        mockProvisionUser.mockReset();
    });

    test('renders admin dashboard', () => {
        render(<AdminPage />);
        expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
        expect(screen.getByText(/provision user/i)).toBeInTheDocument();
        expect(screen.getByTestId('user-list')).toBeInTheDocument();
    });

    test('opens provision modal on button click', async () => {
        const user = userEvent.setup();
        render(<AdminPage />);

        const provisionBtn = screen.getByText(/provision user/i);
        await user.click(provisionBtn);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('handles user provision success', async () => {
        const user = userEvent.setup();
        mockProvisionUser.mockResolvedValue({
            user: { email: 'new@example.com' },
            temporaryPassword: 'temp-password-123'
        });

        render(<AdminPage />);

        // Open modal
        await user.click(screen.getByText(/provision user/i));

        // Submit form (mocked button)
        await user.click(screen.getByText('Mock Submit Form'));

        await waitFor(() => {
            expect(mockProvisionUser).toHaveBeenCalled();
        });

        // Check for success feedback with password
        expect(await screen.findByText('temp-password-123')).toBeInTheDocument();
        expect(screen.getByText(/user created successfully/i)).toBeInTheDocument();
    });
});
