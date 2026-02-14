'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errors';
import Link from 'next/link';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetConfirmSchema, PasswordResetConfirmFormData } from '@/lib/validators/schemas';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [isLoading, setIsLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PasswordResetConfirmFormData>({
        resolver: zodResolver(passwordResetConfirmSchema),
        defaultValues: {
            token: token,
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: PasswordResetConfirmFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/auth/password-reset', {
                token: data.token,
                newPassword: data.newPassword
            });
            setSuccess(true);
        } catch (err) {
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md border border-red-100">
                    <div className="text-center text-red-600">
                        <h2 className="text-2xl font-bold">Invalid Link</h2>
                        <p className="mt-2">This password reset link is invalid or has expired.</p>
                        <Link href="/password/forgot" className="mt-4 inline-block text-blue-600 hover:underline">
                            Request a new link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md border border-green-100">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Password Reset Complete</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your password has been successfully updated. You can now sign in with your new password.
                        </p>
                        <Button className="mt-8 w-full" onClick={() => router.push('/login')}>
                            Go to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-4">
                        <KeyRound className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please enter your new password below.
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            id="password"
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            error={errors.newPassword?.message}
                            {...register('newPassword')}
                        />
                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm New Password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />
                    </div>

                    <Button type="submit" className="w-full py-6 text-lg" isLoading={isLoading}>
                        Update Password
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <React.Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <ResetPasswordContent />
        </React.Suspense>
    );
}
