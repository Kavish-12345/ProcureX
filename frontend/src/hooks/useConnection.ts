import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsApi } from '@/api/connection';

// Retailer: connect to a supplier
export function useCreateConnection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: connectionsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connections'] });
        },
    });
}

// Retailer: get connected suppliers / Supplier: get connected retailers
export function useMyConnections() {
    return useQuery({
        queryKey: ['connections'],
        queryFn: () => connectionsApi.getMyConnections().then((res) => res.data),
    });
}