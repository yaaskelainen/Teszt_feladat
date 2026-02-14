'use client';

import React from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { UserList } from '@/components/admin/UserList';
import { AdminUserForm } from '@/components/admin/AdminUserForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
    // Correctly destructured now: useAdmin returns provisionUser, users, isLoading, error
    const { users, isLoading, error, provisionUser } = useAdmin();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [lastCreatedUser, setLastCreatedUser] = React.useState<{ email: string; pass: string } | null>(null);

    const handleFormSubmit = async (data: any) => {
        try {
            const response = await provisionUser(data);
            if (response && response.user) {
                setLastCreatedUser({ email: response.user.email, pass: response.temporaryPassword });
                setIsModalOpen(false);
            }
        } catch (err) {
            // Error is handled by hook
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Panel</h1>
                    <p className="text-gray-500 text-sm">System administration and user provisioning.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <span>🛡️</span> Provision User
                </Button>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                    <strong>Admin Error:</strong> {error}
                </div>
            )}

            {lastCreatedUser && (
                <div role="alert" className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm animate-in zoom-in-95">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900">User Created Successfully!</h3>
                            <p className="mt-1 text-sm text-blue-700">
                                Please share these credentials with <strong>{lastCreatedUser.email}</strong>.
                            </p>
                        </div>
                        <button
                            onClick={() => setLastCreatedUser(null)}
                            className="text-blue-400 hover:text-blue-600"
                            aria-label="close alert"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-4 rounded-lg bg-white p-4 font-mono text-sm border border-blue-100">
                        <div className="flex-grow">
                            <span className="text-gray-400">Temp Password:</span>
                            <span className="ml-2 font-bold text-gray-900">{lastCreatedUser.pass}</span>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(lastCreatedUser.pass);
                                alert('Password copied to clipboard');
                            }}
                        >
                            Copy
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 px-1">Managed Users</h2>
                <UserList users={users} isLoading={isLoading} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Provision New System User"
            >
                <AdminUserForm onSubmit={handleFormSubmit} disabled={isLoading} />
            </Modal>
        </div>
    );
}
