'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    const navigation = [
        { name: 'Events', href: '/events', icon: '📅' },
        { name: 'AI Help Desk', href: '/help', icon: '🤖' },
    ];

    if (user?.roles.some(r => ['AGENT', 'ADMIN'].includes(r))) {
        navigation.push({ name: 'Agent Dashboard', href: '/agent', icon: '👨‍💼' });
    }

    if (user?.roles.includes('ADMIN')) {
        navigation.push({ name: 'Admin Panel', href: '/admin', icon: '🛡️' });
    }

    navigation.push({ name: 'Security Settings', href: '/settings', icon: '⚙️' });

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">
            {/* Sidebar */}
            <aside className="fixed bottom-0 left-0 top-0 w-64 border-r border-gray-200 bg-white">
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b border-gray-100 px-6">
                        <span className="text-xl font-bold tracking-tight text-blue-600">
                            Event Manager
                        </span>
                    </div>

                    <nav className="flex-grow space-y-1 px-4 py-6">
                        {navigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-gray-100 p-4">
                        <div className="mb-4 flex items-center gap-3 px-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                {user?.email[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="truncate text-xs font-semibold text-gray-900">
                                    {user?.email}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    {user?.roles.join(', ')}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full justify-start gap-2"
                            onClick={logout}
                        >
                            <span>🚪</span> Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-grow p-8">
                <div className="mx-auto max-w-6xl">{children}</div>
            </main>
        </div>
    );
}
