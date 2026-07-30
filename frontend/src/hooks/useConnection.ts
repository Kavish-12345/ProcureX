import { useQuery } from '@tanstack/react-query';
import { connectionsApi } from '@/api/connection';

// Retailer: get connected suppliers / Supplier: get connected retailers
export function useMyConnections() {
    return useQuery({
        queryKey: ['connections'],
        queryFn: () => connectionsApi.getMyConnections().then((res) => res.data),
    });
}