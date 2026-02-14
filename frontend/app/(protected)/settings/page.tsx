'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errors';

export default function SettingsPage() {
    const { user } = useAuth();
    const [isEnabling, setIsEnabling] = React.useState(false);
    const [mfaCode, setMfaCode] = React.useState('');
    const [step, setStep] = React.useState<'idle' | 'verify'>('idle');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const handleStartEnable = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/auth/mfa/enable');
            setStep('verify');
        } catch (err) {
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/auth/mfa/verify', { userId: user?.id, code: mfaCode });
            setSuccess('MFA has been successfully enabled!');
            setStep('idle');
            // Refresh page or user state would be better, but for demo:
            window.location.reload();
        } catch (err) {
            const apiErr = handleApiError(err);
            setError(apiErr.userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Security Settings</h1>
                <p className="mt-2 text-gray-600">
                    Manage your account security and authentication methods.
                </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-xl ${user?.mfaEnabled ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Two-factor Authentication (Email)</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-md">
                                Add an extra layer of security to your account. We'll send a verification code to your email whenever you sign in.
                            </p>
                            {user?.mfaEnabled ? (
                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Currently enabled
                                </div>
                            ) : (
                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    Not enabled
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100">
                        {success}
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-100">
                    {step === 'idle' && !user?.mfaEnabled && (
                        <Button onClick={handleStartEnable} isLoading={isLoading}>
                            Enable Email MFA
                        </Button>
                    )}

                    {step === 'verify' && (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                <p className="text-sm text-blue-800">
                                    We've sent a 6-digit code to <strong>{user?.email}</strong>. Enter it below to confirm.
                                </p>
                            </div>
                            <div className="flex gap-4 items-end">
                                <div className="flex-grow">
                                    <Input
                                        label="Verification Code"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" isLoading={isLoading}>
                                    Verify & Enable
                                </Button>
                                <Button variant="secondary" onClick={() => setStep('idle')} disabled={isLoading}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {user?.mfaEnabled && (
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled>
                            Disable MFA (Contact Admin)
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                    <Mail className="h-6 w-6 text-indigo-400" />
                    <h3 className="text-xl font-bold">Email Notifications</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    You will receive critical security alerts and password reset instructions at <strong>{user?.email}</strong>.
                    This cannot be changed currently as it is verified by your organization.
                </p>
            </div>
        </div>
    );
}
