/**
 * Form Validation Schemas using Zod
 * Implementation to make tests pass (TDD GREEN phase)
 */

import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Event Creation Schema
export const createEventSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(150, 'Title must not exceed 150 characters'),
    occurrence: z.date().refine(
        (date) => date > new Date(),
        'Event date must be in the future'
    ),
    description: z
        .string()
        .max(5000, 'Description must not exceed 5000 characters')
        .optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

// Event Update Schema
export const updateEventSchema = z.object({
    description: z
        .string()
        .max(5000, 'Description must not exceed 5000 characters'),
});

export type UpdateEventFormData = z.infer<typeof updateEventSchema>;

// Chat Message Schema
export const chatMessageSchema = z.object({
    content: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message must not exceed 2000 characters'),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;

// User Creation Schema (Admin)
export const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    roles: z
        .array(z.enum(['USER', 'AGENT', 'ADMIN']))
        .min(1, 'At least one role is required'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

// Password Reset Confirm Schema
export const passwordResetConfirmSchema = z
    .object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;
