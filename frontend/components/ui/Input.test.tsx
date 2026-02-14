/**
 * Input Component Tests (UT-UI-002)
 * TDD: Writing tests FIRST
 */

// Use global describe, test, expect
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
    test('renders input with label', () => {
        render(<Input label="Email address" id="email" />);
        const input = screen.getByLabelText(/email address/i);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('id', 'email');
    });

    test('renders error message', () => {
        render(<Input label="Email" error="Invalid email format" />);
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('handles user input', () => {
        render(<Input label="Name" placeholder="Enter name" />);
        const input = screen.getByPlaceholderText(/enter name/i);
        fireEvent.change(input, { target: { value: 'John Doe' } });
        expect(input).toHaveValue('John Doe');
    });

    test('disabled state', () => {
        render(<Input label="Name" disabled />);
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
        expect(input).toHaveClass('disabled:opacity-50');
    });

    test('supports different input types', () => {
        render(<Input label="Password" type="password" />);
        // Password inputs don't have role 'textbox', so fetch by label
        const input = screen.getByLabelText(/password/i);
        expect(input).toHaveAttribute('type', 'password');
    });
});
