/**
 * Form Validation Tests (UT-UTIL-002)
 * Following TDD: Writing tests BEFORE implementation
 */

// Use global describe, test, expect
import {
    loginSchema,
    createEventSchema,
    updateEventSchema,
    chatMessageSchema,
    createUserSchema,
    passwordResetRequestSchema,
    passwordResetConfirmSchema,
} from './schemas';

describe('Login Schema Validation', () => {
    test('should accept valid email and password', () => {
        const validData = {
            email: 'user@example.com',
            password: 'password123',
        };

        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should reject invalid email format', () => {
        const invalidData = {
            email: 'not-an-email',
            password: 'password123',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject password shorter than 8 characters', () => {
        const invalidData = {
            email: 'user@example.com',
            password: 'short',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject missing email', () => {
        const invalidData = {
            password: 'password123',
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Event Creation Schema Validation', () => {
    test('should accept valid event data', () => {
        const validData = {
            title: 'Team Meeting',
            occurrence: new Date('2026-12-25T10:00:00Z'),
            description: 'Quarterly review and planning',
        };

        const result = createEventSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should reject title exceeding 150 characters', () => {
        const invalidData = {
            title: 'a'.repeat(151),
            occurrence: new Date('2026-12-25T10:00:00Z'),
        };

        const result = createEventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject empty title', () => {
        const invalidData = {
            title: '',
            occurrence: new Date('2026-12-25T10:00:00Z'),
        };

        const result = createEventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject description exceeding 5000 characters', () => {
        const invalidData = {
            title: 'Meeting',
            occurrence: new Date('2026-12-25T10:00:00Z'),
            description: 'a'.repeat(5001),
        };

        const result = createEventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should accept valid event without description', () => {
        const validData = {
            title: 'Meeting',
            occurrence: new Date('2026-12-25T10:00:00Z'),
        };

        const result = createEventSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should reject past dates', () => {
        const invalidData = {
            title: 'Meeting',
            occurrence: new Date('2020-01-01T10:00:00Z'),
        };

        const result = createEventSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Chat Message Schema Validation', () => {
    test('should accept valid message', () => {
        const validData = {
            content: 'How do I create an event?',
        };

        const result = chatMessageSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should reject empty message', () => {
        const invalidData = {
            content: '',
        };

        const result = chatMessageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject message exceeding 2000 characters', () => {
        const invalidData = {
            content: 'a'.repeat(2001),
        };

        const result = chatMessageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('User Creation Schema Validation', () => {
    test('should accept valid user data', () => {
        const validData = {
            email: 'newuser@example.com',
            roles: ['USER'],
        };

        const result = createUserSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should accept multiple roles', () => {
        const validData = {
            email: 'admin@example.com',
            roles: ['USER', 'ADMIN'],
        };

        const result = createUserSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should reject invalid email', () => {
        const invalidData = {
            email: 'invalid-email',
            roles: ['USER'],
        };

        const result = createUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject empty roles array', () => {
        const invalidData = {
            email: 'user@example.com',
            roles: [],
        };

        const result = createUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject invalid role', () => {
        const invalidData = {
            email: 'user@example.com',
            roles: ['INVALID_ROLE'],
        };

        const result = createUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Password Reset Request Schema Validation', () => {
    test('should accept valid email', () => {
        const validData = {
            email: 'user@example.com',
        };

        const result = passwordResetRequestSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should reject invalid email', () => {
        const invalidData = {
            email: 'not-an-email',
        };

        const result = passwordResetRequestSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Password Reset Confirm Schema Validation', () => {
    test('should accept valid password confirmation', () => {
        const validData = {
            token: 'reset-token-123',
            newPassword: 'NewPassword123!',
            confirmPassword: 'NewPassword123!',
        };

        const result = passwordResetConfirmSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    test('should reject password shorter than 8 characters', () => {
        const invalidData = {
            token: 'reset-token-123',
            newPassword: 'Short1!',
            confirmPassword: 'Short1!',
        };

        const result = passwordResetConfirmSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    test('should reject mismatched passwords', () => {
        const invalidData = {
            token: 'reset-token-123',
            newPassword: 'Password123!',
            confirmPassword: 'DifferentPass123!',
        };

        const result = passwordResetConfirmSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
