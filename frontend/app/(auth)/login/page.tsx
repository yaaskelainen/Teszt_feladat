'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators/schemas';
import { LoginDto } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MFAVerifyModal } from '@/components/auth/MFAVerifyModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, error } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginDto>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginDto) => {
        setSubmitting(true);
        try {
            const result = await login(data);
            if (!result.mfaRequired) {
                router.push('/events');
            }
            // If mfaRequired is true, the MFAVerifyModal will automatically appear
            // because it watches the auth state.
        } catch (err: any) {
            console.error('Login failed', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <MFAVerifyModal />

            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Login Failed
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="mb-4">
                            <Input
                                id="email"
                                type="email"
                                label="Email address"
                                autoComplete="email"
                                error={errors.email?.message}
                                {...register('email')}
                            />
                        </div>
                        <div>
                            <Input
                                id="password"
                                type="password"
                                label="Password"
                                autoComplete="current-password"
                                error={errors.password?.message}
                                {...register('password')}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                href="/password/forgot"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={submitting}
                        >
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
