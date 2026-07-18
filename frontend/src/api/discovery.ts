import client from './client';

interface Supplier {
    id: string;
    name: string;
    businessName: string;
    phone: string;
    createdAt: string;
}

interface BrowseSuppliersResponse {
    suppliers: Supplier[];
}

export const discoveryApi = {
    // Anyone: browse/search suppliers
    browseSuppliers: (search?: string) =>
        client.get<BrowseSuppliersResponse>('/discovery/suppliers', {
            params: search ? { search } : undefined,
        }),
};