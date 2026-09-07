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

interface ForgotPasswordData {
    email: string;
}

interface ResetPasswordData {
    token: string;
    password: string;
}

interface UpdateProfileData {
    name?: string;
    businessName?: string;
    phone?: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
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

    forgotPassword: (data: ForgotPasswordData) =>
        client.post<{ message: string }>('/auth/forgot-password', data),

    resetPassword: (data: ResetPasswordData) =>
        client.post<{ message: string }>('/auth/reset-password', data),

    updateProfile: (data: UpdateProfileData) =>
        client.patch<AuthResponse>('/auth/profile', data),

    changePassword: (data: ChangePasswordData) =>
        client.patch<{ message: string }>('/auth/profile/password', data),
};
