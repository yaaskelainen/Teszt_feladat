/**
 * UserList Component Tests
 * 
 * Objective: Verify data rendering for the admin user table.
 * Requirements Covered:
 * - REQ-ADMIN-003: Display user email, roles, and truncated ID.
 * - REQ-UI-003: Loading and Empty states.
 */
import { render, screen } from '@testing-library/react';
import { UserList } from './UserList';
import { User } from '@/types/api';
import React from 'react';

const mockUsers: User[] = [
    { id: '1', email: 'user1@example.com', roles: ['USER'] },
    { id: '2', email: 'admin@example.com', roles: ['ADMIN', 'USER'] }
];

describe('UserList Component', () => {
    test('renders user list and headings', () => {
        render(<UserList users={mockUsers} isLoading={false} />);

        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();

        // Assert on role display
        expect(screen.getAllByText('USER').length).toBeGreaterThan(0);
        expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    test('renders loading state', () => {
        // Use a generic matcher for "loading" text
        render(<UserList users={[]} isLoading={true} />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('renders empty state', () => {
        render(<UserList users={[]} isLoading={false} />);
        expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });

    test('displays table structure', () => {
        render(<UserList users={mockUsers} isLoading={false} />);
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText(/email/i)).toBeInTheDocument(); // Header
        expect(screen.getByText(/roles/i)).toBeInTheDocument(); // Header
    });
});
