/**
 * Settings Page Tests (UT-UI-003)
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from './page';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/lib/api/client', () => ({
    apiClient: {
        post: jest.fn(),
    },
}));

describe('Settings Page', () => {
    const mockUser = {
        id: '1',
        email: 'test@example.com',
        mfaEnabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
        });
    });

    it('renders current MFA status (disabled)', () => {
        render(<SettingsPage />);
        expect(screen.getByText(/not enabled/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enable email mfa/i })).toBeInTheDocument();
    });

    it('starts MFA enablement flow', async () => {
        (apiClient.post as jest.Mock).mockResolvedValue({});

        render(<SettingsPage />);
        fireEvent.click(screen.getByRole('button', { name: /enable email mfa/i }));

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/auth/mfa/enable');
            expect(screen.getByText(/we've sent a 6-digit code/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
        });
    });

    it('completes MFA verification successfully', async () => {
        (apiClient.post as jest.Mock)
            .mockResolvedValueOnce({}) // mfa/enable
            .mockResolvedValueOnce({}); // mfa/verify

        render(<SettingsPage />);

        // Start flow
        fireEvent.click(screen.getByRole('button', { name: /enable email mfa/i }));

        await waitFor(() => expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument());

        // Fill and verify
        fireEvent.change(screen.getByLabelText(/verification code/i), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /verify & enable/i }));

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/auth/mfa/verify', { userId: '1', code: '123456' });
            expect(screen.getByText(/mfa has been successfully enabled/i)).toBeInTheDocument();
        });

    });

    it('renders status when MFA is already enabled', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { ...mockUser, mfaEnabled: true },
        });

        render(<SettingsPage />);
        expect(screen.getByText(/currently enabled/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /disable mfa/i })).toBeInTheDocument();
    });
});
