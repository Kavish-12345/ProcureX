import client from './client';
import type { Product } from '@/types';

interface CreateProductData {
    name: string;
    description?: string;
    unitPrice: number;
    stock: number;
    unit: string;
}

// Partial<T> is a TypeScript utility type. Makes every field optional. 
interface UpdateProductData extends Partial<CreateProductData> { }

interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ProductsResponse {
    products: Product[];
    pagination: PaginationInfo;
}

interface ProductResponse {
    product: Product;
}

export const productsApi = {
    // Supplier: get their own products
    getMyProducts: (params?: GetProductsParams) =>
        client.get<ProductsResponse>('/products', { params }),

     // Anyone: get a supplier's products (public catalog)
    getBySupplier: (supplierId: string, params?: GetProductsParams) =>
        client.get<ProductsResponse>(`/products/supplier/${supplierId}`, { params }),

    // Anyone: get a single product by id
    getById: (id: string) =>
        client.get<ProductResponse>(`/products/${id}`),

    // Supplier: create a product
    create: (data: CreateProductData) =>
        client.post<ProductResponse>('/products', data),

    // Supplier: update their product
    update: (id: string, data: UpdateProductData) =>
        client.patch<ProductResponse>(`/products/${id}`, data),

    // Supplier: delete their product
    delete: (id: string) =>
        client.delete(`/products/${id}`),
};