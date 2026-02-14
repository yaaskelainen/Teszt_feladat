// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        pathname: '/',
        query: {},
        asPath: '/',
    })),
    usePathname() {
        return '/';
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_NAME = 'Event Manager';
process.env.NEXT_PUBLIC_ENVIRONMENT = 'test';

// Global Mock for AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    __esModule: true,
    useAuth: jest.fn(() => ({
        user: null,
        isLoading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: false,
    })),
    AuthProvider: ({ children }) => children,
}));

// AuthContext should be mocked in individual tests if needed,
// or it will use the manual mock in contexts/__mocks__/AuthContext.tsx automatically if jest.mock() is called.
