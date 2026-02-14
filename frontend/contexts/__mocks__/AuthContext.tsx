import { jest } from '@jest/globals';
import React from 'react';

export const useAuth = jest.fn(() => ({
    user: null,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
}));

export const AuthProvider = ({ children }: { children: React.ReactNode }) => children;
