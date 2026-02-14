'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

export function MFAVerifyModal() {
    const { mfaRequired, verifyMfa, logout, error } = useAuth();
    const router = useRouter();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Watch for mfaRequired to reset state if needed
    React.useEffect(() => {
        if (!mfaRequired) {
            setCode('');
            setIsLoading(false);
        }
    }, [mfaRequired]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || code.length < 6) return;

        setIsLoading(true);
        try {
            await verifyMfa(code);
            // On success, verifyMfa updates state, mfaRequired becomes false
            // Navigation should happen based on auth state or here
            router.push('/events');
        } catch (err) {
            console.error('MFA Verification failed', err);
            // Error is set in AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // If user closes MFA modal, they are essentially cancelling the login
        logout();
    };

    return (
        <Modal
            isOpen={mfaRequired}
            onClose={handleClose}
            title="Two-Factor Authentication"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-xl">🛡️</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Security Check</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>We've sent a 6-digit verification code to your email.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100 animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <Input
                    id="mfa-code"
                    label="Verification Code"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    autoFocus
                    className="text-center text-lg tracking-widest"
                />

                <div className="flex gap-3 justify-end pt-2">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
                        Verify Identity
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
