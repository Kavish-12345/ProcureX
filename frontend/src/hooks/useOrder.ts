import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/order';

// Retailer: place an order
export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            // stock changes only on confirm, not create, but products list can still be invalidated defensively
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Supplier: update order status
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        // Parameters<T> is a built-in TypeScript utility type that extracts a function's parameter types as a tuple.
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof ordersApi.updateStatus>[1] }) =>
            ordersApi.updateStatus(id, data),
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
            // status changes can affect stock (confirm/cancel) and ledger (confirm)
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
        },
    });
}

// Retailer: get their own orders
export function useMyOrdersAsRetailer() {
    return useQuery({
        queryKey: ['orders', 'retailer'],
        queryFn: () => ordersApi.getMyOrdersAsRetailer().then((res) => res.data),
    });
}

// Supplier: get their own orders
export function useMyOrdersAsSupplier() {
    return useQuery({
        queryKey: ['orders', 'supplier'],
        queryFn: () => ordersApi.getMyOrdersAsSupplier().then((res) => res.data),
    });
}

// Either party: get order by id
export function useOrder(id: string) {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => ordersApi.getById(id).then((res) => res.data),
        enabled: !!id,
    });
}