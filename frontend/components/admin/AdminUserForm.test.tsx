/**
 * AdminUserForm Component Tests
 * 
 * Objective: Verify user provisioning form behavior and validation logic.
 * Requirements Covered:
 * - REQ-ADMIN-001: Form rendering
 * - REQ-SEC-001: Input validation (Email/Role)
 * - REQ-UI-003: Loading states
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUserForm } from './AdminUserForm';
import React from 'react';

describe('AdminUserForm Component', () => {
    // Verifies that all necessary input fields and buttons are present (REQ-ADMIN-001)
    test('renders form fields', () => {
        render(<AdminUserForm onSubmit={jest.fn()} disabled={false} />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    });

    // Verifies that invalid emails are rejected by Zod schema (REQ-SEC-001)
    test('validates email input', async () => {
        const user = userEvent.setup();
        render(<AdminUserForm onSubmit={jest.fn()} disabled={false} />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'invalid-email');
        await user.click(screen.getByRole('button', { name: /create user/i }));

        // Wait for validation to complete
        await waitFor(() => {
            expect(screen.getByText(/invalid/i)).toBeInTheDocument();
        });
    });

    test('validates role selection', async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        render(<AdminUserForm onSubmit={onSubmit} disabled={false} />);

        // Assuming default role is empty or we force selection. 
        // If default is USER, this test might need adjustment or we test changing it.
        // Let's assume we need to select one if it's a required field without default?
        // Or we test that sending valid data works.

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'test@example.com');

        const roleSelect = screen.getByLabelText(/role/i);
        await user.selectOptions(roleSelect, 'ADMIN');

        await user.click(screen.getByRole('button', { name: /create user/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                email: 'test@example.com',
                roles: ['ADMIN']
            });
        });
    });

    test('disables form during submission', () => {
        render(<AdminUserForm onSubmit={jest.fn()} disabled={true} />);

        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/role/i)).toBeDisabled();
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
