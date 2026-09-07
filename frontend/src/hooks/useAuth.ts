import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export function useSignUp() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: authApi.signup,
        onSuccess: (res) => {
            setUser(res.data.user);
            navigate({ to: '/dashboard' });
        },
    });
};

export function useLogin() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (res) => {
            setUser(res.data.user);
            navigate({ to: '/dashboard' });
        },
    });
}

export function useLogout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const clearUser = useAuthStore((state) => state.clearUser);

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            clearUser();
            queryClient.clear();
            navigate({ to: '/auth/login' });
        },
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: authApi.forgotPassword,
    });
}

export function useResetPassword() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.resetPassword,
        onSuccess: () => {
            navigate({ to: '/auth/login' });
        },
    });
}

export function useUpdateProfile() {
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: (res) => {
            setUser(res.data.user);
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: authApi.changePassword,
    });
}
