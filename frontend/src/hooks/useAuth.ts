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
        mutationFn: async (data: Parameters<typeof authApi.login>[0]) => {
            const res = await authApi.login(data);

            if (res.data.user.role === 'ADMIN') {
                // The backend has already issued cookies at this point, so simply
                // showing an error would leave a real, usable session behind.
                // Revoking them is what makes the rejection actually mean anything.
                await authApi.logout();
                throw new Error('Administrators must sign in from the admin portal');
            }

            return res;
        },
        onSuccess: (res) => {
            setUser(res.data.user);
            navigate({ to: '/dashboard' });
        },
    });
}

export function useAdminLogin() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: async (data: Parameters<typeof authApi.login>[0]) => {
            const res = await authApi.login(data);

            if (res.data.user.role !== 'ADMIN') {
                await authApi.logout();
                throw new Error('This account does not have admin access');
            }

            return res;
        },
        onSuccess: (res) => {
            setUser(res.data.user);
            navigate({ to: '/admin' });
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
