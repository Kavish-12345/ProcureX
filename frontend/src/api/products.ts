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

interface ProductsResponse {
    products: Product[];
}

interface ProductResponse {
    product: Product;
}

export const productsApi = {
    // Supplier: get their own products
    getMyProducts: () =>
        client.get<ProductsResponse>('/products'),

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