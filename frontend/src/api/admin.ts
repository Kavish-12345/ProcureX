import client from './client';
import type { User, Order, PlatformStats } from '@/types';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UsersResponse {
    users: User[];
    pagination: PaginationInfo;
}

interface OrdersResponse {
    orders: Order[];
    pagination: PaginationInfo;
}

interface StatsResponse {
    stats: PlatformStats;
}

interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'RETAILER' | 'SUPPLIER' | 'ADMIN';
    isActive?: boolean;
}

interface GetOrdersParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

export const adminApi = {
    getUsers: (params?: GetUsersParams) =>
        client.get<UsersResponse>('/admin/users', { params }),

    getOrders: (params?: GetOrdersParams) =>
        client.get<OrdersResponse>('/admin/orders', { params }),

    getStats: () =>
        client.get<StatsResponse>('/admin/stats'),

    setUserActive: (id: string, isActive: boolean) =>
        client.patch<{ message: string; user: User }>(`/admin/users/${id}/active`, { isActive }),
};
