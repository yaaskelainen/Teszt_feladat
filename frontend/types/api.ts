/**
 * API Request and Response Types
 * These types match the backend OpenAPI specification
 */

// User and Authentication Types
export interface User {
    id: string;
    email: string;
    roles: Role[];
    mfaEnabled?: boolean;
}

export type Role = 'USER' | 'AGENT' | 'ADMIN';

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshDto {
    refreshToken: string;
}

// Event Types
export interface Event {
    id: string;
    title: string;
    occurrence: string; // ISO 8601 date-time
    description?: string;
    userId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEventDto {
    title: string;
    occurrence: string; // ISO 8601 date-time
    description?: string;
}

export interface UpdateEventDto {
    description: string;
}

// Help Desk Types
export interface ChatMessage {
    id: string;
    userId: string;
    content: string;
    role: 'USER' | 'AI' | 'AGENT';
    createdAt: string;
    senderId?: string;
    receiverId?: string;
}

export interface SendMessageDto {
    content: string;
}

export interface ChatResponse {
    userMessage: {
        id: string;
        content: string;
        role: 'USER';
        timestamp: string;
    };
    aiReply: {
        id: string;
        content: string;
        role: 'AI';
        timestamp: string;
    };
}

// Admin Types
export interface AdminCreateUserDto {
    email: string;
    roles: Role[];
}

export interface CreateUserResponse {
    user: {
        id: string;
        email: string;
        roles: Role[];
    };
    temporaryPassword: string;
}

// Error Types
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}
