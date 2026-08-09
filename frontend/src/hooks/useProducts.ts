import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/api/products';

// Supplier: get their own products
export function useMyProducts(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['products', 'mine', params],
    queryFn: () => productsApi.getMyProducts(params).then((res) => res.data),
    placeholderData: (previousData) => previousData, // keep old page visible while fetching next
  });
}

// Anyone: get a single product by id
export function useProduct(id: string) {
    return useQuery({
        queryKey: ['products', id],
        queryFn: () => productsApi.getById(id).then((res) => res.data),
        enabled: !!id,
    });
}

// Supplier: create a product
export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Anyone: get products belonging to a specific supplier
export function useSupplierProducts(
  supplierId: string,
  params?: { page?: number; limit?: number; search?: string }
) {
  return useQuery({
    queryKey: ['products', 'supplier', supplierId, params],
    queryFn: () => productsApi.getBySupplier(supplierId, params).then((res) => res.data),
    enabled: !!supplierId,
    placeholderData: (previousData) => previousData, // keep old page visible while fetching next
  });
}

// Supplier: update their product
export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productsApi.update>[1] }) =>
            productsApi.update(id, data),
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
        },
    });
}

// Supplier: delete their product
export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}