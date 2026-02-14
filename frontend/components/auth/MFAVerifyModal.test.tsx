import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MFAVerifyModal } from './MFAVerifyModal';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Create a mock context value
const mockVerifyMfa = jest.fn();
const mockLogout = jest.fn();

// Mock useAuth directly
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        mfaRequired: true,
        verifyMfa: mockVerifyMfa,
        logout: mockLogout,
        error: null,
    }),
}));

describe('MFAVerifyModal', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        jest.clearAllMocks();
    });

    it('renders when mfaRequired is true', () => {
        render(<MFAVerifyModal />);
        expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
        expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
    });

    it('handles input change', () => {
        render(<MFAVerifyModal />);
        const input = screen.getByLabelText('Verification Code') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '123456' } });
        expect(input.value).toBe('123456');
    });

    it('submits the form with code', async () => {
        render(<MFAVerifyModal />);
        const input = screen.getByLabelText('Verification Code');
        fireEvent.change(input, { target: { value: '123456' } });

        const submitButton = screen.getByText('Verify Identity');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockVerifyMfa).toHaveBeenCalledWith('123456');
            expect(mockPush).toHaveBeenCalledWith('/events');
        });
    });

    it('calls logout on cancel', () => {
        render(<MFAVerifyModal />);
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(mockLogout).toHaveBeenCalled();
    });
});
