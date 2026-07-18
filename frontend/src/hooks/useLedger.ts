import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ledgerApi } from '@/api/ledgerEntry';

// Retailer: what they owe to each supplier
export function useMyDues() {
    return useQuery({
        queryKey: ['ledger', 'dues'],
        queryFn: () => ledgerApi.getMyDues().then((res) => res.data),
    });
}

// Supplier: what each retailer owes them
export function useMyReceivables() {
    return useQuery({
        queryKey: ['ledger', 'receivables'],
        queryFn: () => ledgerApi.getMyReceivables().then((res) => res.data),
    });
}

// Supplier: mark a ledger entry as paid
export function useMarkAsPaid() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data?: Parameters<typeof ledgerApi.markAsPaid>[1] }) =>
            ledgerApi.markAsPaid(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
        },
    });
}