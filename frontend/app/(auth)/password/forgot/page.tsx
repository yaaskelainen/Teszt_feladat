'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errors';

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/auth/password-reset-request', { email });
            setSubmitted(true);
        } catch (err) {
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6 group">
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to login
                    </Link>

                    {!submitted ? (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 mb-6">
                                <KeyRound className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Forgot password?
                            </h2>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                No worries, we'll send you reset instructions.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 mb-6">
                                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Check your email
                            </h2>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                We've sent a password reset link to your email address.
                            </p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                        {error}
                    </div>
                )}

                {!submitted ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <Input
                                id="email"
                                type="email"
                                label="Email address"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full py-6 text-lg" isLoading={isLoading}>
                            Reset Password
                        </Button>
                    </form>
                ) : (
                    <div className="mt-8">
                        <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
                            Didn't receive the email? Check your spam folder or{' '}
                            <button
                                onClick={() => setSubmitted(false)}
                                className="font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                try again
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
