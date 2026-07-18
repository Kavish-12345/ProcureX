import { useQuery } from '@tanstack/react-query';
import { discoveryApi } from '@/api/discovery';

// Anyone: browse/search suppliers
export function useBrowseSuppliers(search?: string) {
    return useQuery({
        queryKey: ['discovery', 'suppliers', search ?? ''],
        queryFn: () => discoveryApi.browseSuppliers(search).then((res) => res.data),
    });
}