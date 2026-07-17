import client from './client';
import type { User } from '@/types';

interface SignupData {
    email: string;
    password: string;
    name: string;
    businessName: string;
    phone: string;
    role: 'RETAILER' | 'SUPPLIER';
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    message: string;
    user: User;
}

export const authApi = {
    signup: (data: SignupData) =>
        client.post<AuthResponse>('/auth/signup', data),

    login: (data: LoginData) =>
        client.post<AuthResponse>('/auth/login', data),

    logout: () =>
        client.post('/auth/logout'),

    refresh: () =>
        client.post('/auth/refresh'),
};
