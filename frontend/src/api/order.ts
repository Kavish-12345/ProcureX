import client from './client';
import type { Order } from '@/types';

interface CreateOrderItem {
    productId: string;
    quantity: number;
}

interface CreateOrderData {
    supplierId: string;
    items: CreateOrderItem[];
}

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface UpdateOrderStatusData {
    status: OrderStatus;
    dueDate?: string; // required by backend only when status === 'CONFIRMED'
}

interface OrdersResponse {
    orders: Order[];
}

interface OrderResponse {
    order: Order;
}

export const ordersApi = {
    // Retailer: place an order
    create: (data: CreateOrderData) =>
        client.post<{ message: string; order: Order }>('/orders', data),

    // Supplier: update order status (state machine enforced server-side)
    updateStatus: (id: string, data: UpdateOrderStatusData) =>
        client.patch<{ message: string; order: Order }>(`/orders/${id}/status`, data),

    // Retailer: get their own orders
    getMyOrdersAsRetailer: () =>
        client.get<OrdersResponse>('/orders/retailer/me'),

    // Supplier: get their own orders
    getMyOrdersAsSupplier: () =>
        client.get<OrdersResponse>('/orders/supplier/me'),

    // Either party on the order: get by id
    getById: (id: string) =>
        client.get<OrderResponse>(`/orders/${id}`),
};
