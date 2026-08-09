export interface User {
  id: string;
  name: string;
  email: string;
  role: 'RETAILER' | 'SUPPLIER' | 'ADMIN';
  businessName: string;
  phone: string;
}

export interface Supplier {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  createdAt: string;
}

export interface SupplierSummary {
  id: string;
  name: string;
  businessName: string;
  phone: string;
}

export interface SupplierRetailerConnection {
  id: string;
  supplierId: string;
  retailerId: string;
  createdAt: string;
  supplier?: SupplierSummary;
  retailer?: SupplierSummary;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  stock: number;
  unit: string;
  createdAt: string;
  supplierId: string;
  supplier?: {
    id: string;
    name: string;
    businessName: string;
  };
  totalValue: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  productId: string;
  product?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface LedgerEntry {
  id: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  orderId: string;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  retailerId: string;
  supplierId: string;
  retailer?: {
    id: string;
    name: string;
    businessName: string;
  };
  supplier?: {
    id: string;
    name: string;
    businessName: string;
  };
  items?: OrderItem[];
  ledgerEntry?: LedgerEntry;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}