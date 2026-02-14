/**
 * Button Component Tests (UT-UI-001)
 * TDD: Writing tests FIRST
 */

// Use global describe, test, expect, jest
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
    test('renders button with children', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    test('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('shows loading state', () => {
        render(<Button isLoading>Click me</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(screen.getByText(/loading/i)).toBeInTheDocument(); // Or spinner check
        // Ideally we check for a spinner or updated text
    });

    test('disabled state prevents clicks', () => {
        const handleClick = jest.fn();
        render(<Button disabled onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    test('applies variant classes', () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        let button = screen.getByRole('button');
        expect(button.className).toContain('bg-blue-600'); // Assuming tailwind logic

        rerender(<Button variant="danger">Danger</Button>);
        button = screen.getByRole('button');
        expect(button.className).toContain('bg-red-600');
    });
});
