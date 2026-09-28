import client from './client';
import type { Notification } from '@/types';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface NotificationsResponse {
    notifications: Notification[];
    pagination: PaginationInfo;
}

interface UnreadCountResponse {
    count: number;
}

export const notificationsApi = {
    // Current user: their own notifications, newest first
    getMine: (params?: { page?: number; limit?: number }) =>
        client.get<NotificationsResponse>('/notifications', { params }),

    // Kept separate from the list because this is the one that gets polled
    getUnreadCount: () =>
        client.get<UnreadCountResponse>('/notifications/unread-count'),

    markAsRead: (id: string) =>
        client.patch(`/notifications/${id}/read`),

    markAllAsRead: () =>
        client.patch('/notifications/read-all'),
};
