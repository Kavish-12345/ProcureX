import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export function useAdminStats() {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: () => adminApi.getStats().then((res) => res.data.stats),
    });
}

export function useAdminUsers(params?: Parameters<typeof adminApi.getUsers>[0]) {
    return useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: () => adminApi.getUsers(params).then((res) => res.data),
        placeholderData: (previousData) => previousData,
    });
}

export function useAdminOrders(params?: Parameters<typeof adminApi.getOrders>[0]) {
    return useQuery({
        queryKey: ['admin', 'orders', params],
        queryFn: () => adminApi.getOrders(params).then((res) => res.data),
        placeholderData: (previousData) => previousData,
    });
}

export function useSetUserActive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            adminApi.setUserActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            // Suspending changes nothing about counts, but reactivation can
            // affect what the overview reports, so keep them consistent.
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        },
    });
}
