'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createUserSchema, CreateUserFormData } from '@/lib/validators/schemas';
import { Role } from '@/types/api';

export interface AdminUserFormProps {
    onSubmit: (data: CreateUserFormData) => Promise<void>;
    disabled?: boolean;
}

/**
 * AdminUserForm Component
 * 
 * Implements REQ-ADMIN-001: User Provisioning Interface
 * Implements REQ-ADMIN-002: Role Assignment (USER, AGENT, ADMIN)
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onSubmit - Handler called with valid form data (REQ-LOGIC-001)
 * @param {boolean} props.disabled - Disables form during submission (REQ-UI-003)
 * 
 * Tested by: `frontend/components/admin/AdminUserForm.test.tsx`
 * - Validates email format (Test: "validates email input")
 * - Enforces role selection (Test: "validates role selection")
 * - Handles loading state (Test: "disables form during submission")
 */
export function AdminUserForm({ onSubmit, disabled = false }: AdminUserFormProps) {
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<Role>('USER');
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    // Validates form using Zod schema (REQ-SEC-001: Input Validation)
    // See `frontend/lib/validators/schemas.ts` for regex details.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        // Prepare data for validation
        const formData = {
            email,
            roles: [role] // Schema expects array for future extensibility
        };

        const result = createUserSchema.safeParse(formData);

        if (!result.success) {
            // Map validation errors to UI fields
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const key = issue.path[0] === 'roles' ? 'role' : String(issue.path[0]);
                fieldErrors[key] = issue.message;
            });
            setFormErrors(fieldErrors);
            return;
        }

        try {
            await onSubmit(result.data);
            // Reset form on success (REQ-UX-001: Clear after submit)
            setEmail('');
            setRole('USER');
        } catch (error) {
            // Parent handles submission errors
        }
    };

    return (
        // `noValidate` prevents browser popup, allowing custom Zod validation visualization
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm" noValidate>
            <div>
                <h3 className="text-lg font-medium text-gray-900">Provision New User</h3>
                <p className="text-sm text-gray-500">Create a new account with specific roles.</p>
            </div>

            <Input
                label="Email Address"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                disabled={disabled}
                placeholder="user@example.com"
                required
            />

            <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                </label>
                <select
                    id="role"
                    aria-label="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    disabled={disabled}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                    <option value="USER">User (Standard)</option>
                    <option value="AGENT">Agent (Help Desk)</option>
                    <option value="ADMIN">Admin (System)</option>
                </select>
                {formErrors.role && (
                    <p className="text-sm text-red-600">{formErrors.role}</p>
                )}
            </div>

            <Button type="submit" isLoading={disabled} className="w-full">
                Create User
            </Button>
        </form>
    );
}
