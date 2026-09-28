import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';

// Current user: their notification list. `enabled` lets the bell hold off on
// fetching the list until its panel is actually opened.
export function useNotifications(
    params?: { page?: number; limit?: number },
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationsApi.getMine(params).then((res) => res.data),
        enabled: options?.enabled ?? true,
    });
}

// The badge count. Overrides the global 5-minute staleTime — without that,
// the count would sit cached and the badge would lag well behind reality.
// Polling (rather than websockets) is deliberate: a badge doesn't justify
// standing up a realtime connection.
export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ['notifications', 'unreadCount'],
        queryFn: () => notificationsApi.getUnreadCount().then((res) => res.data.count),
        staleTime: 0,
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
