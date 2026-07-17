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
            navigate({ to: '/' });
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
            navigate({ to: '/' });
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
            navigate({ to: '/' });
        },
    });
}
