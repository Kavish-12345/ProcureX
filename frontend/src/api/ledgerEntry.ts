import client from './client';
import type { LedgerEntry } from '@/types';

interface DueEntry extends LedgerEntry {
    order: {
        id: string;
        totalAmount: number;
        createdAt: string;
        supplier: {
            id: string;
            name: string;
            businessName: string;
        };
    };
}

interface ReceivableEntry extends LedgerEntry {
    order: {
        id: string;
        totalAmount: number;
        createdAt: string;
        retailer: {
            id: string;
            name: string;
            businessName: string;
        };
    };
}

interface DuesResponse {
    entries: DueEntry[];
}

interface ReceivablesResponse {
    entries: ReceivableEntry[];
}

interface MarkPaidData {
    paidAt?: string;
}

interface MarkPaidResponse {
    message: string;
    entry: LedgerEntry;
}

export const ledgerApi = {

    // Retailer: what they owe to each supplier
    getMyDues: () =>
        client.get<DuesResponse>('/ledger/dues'),

    // Supplier: what each retailer owes them
    getMyReceivables: () =>
        client.get<ReceivablesResponse>('/ledger/receivables'),

    // Supplier: mark a ledger entry as paid
    markAsPaid: (id: string, data?: MarkPaidData) =>
        client.patch<MarkPaidResponse>(`/ledger/${id}/pay`, data),
}
