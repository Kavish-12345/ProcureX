import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { useAdminOrders } from '@/hooks/useAdmin';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { orderStatusTone } from '@/lib/orderStatusStyles';
import { requireAdmin } from '@/lib/requireAdmin';

type StatusFilter = '' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const Route = createFileRoute('/admin/orders')({
  beforeLoad: requireAdmin,
  component: AdminOrdersPage,
});

const PAGE_SIZE = 20;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');

  const search = useDebouncedValue(searchInput);

  // Any filter change invalidates the current page number — staying on page 4
  // of the old result set almost always lands you on an empty screen.
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const { data, isLoading, isFetching } = useAdminOrders({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;
  const hasFilters = Boolean(search || status);

  return (
    <PageWrapper>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
        Admin
      </p>
      <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight">All orders</h1>
      <p className="mt-1 text-[13px] text-black/55">
        Every order on the platform, newest first.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by retailer or supplier…"
          />
          <FilterSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        </div>
        {pagination && (
          <p className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wide text-black/45">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <LoadingSpinner label="Loading orders…" />
        ) : orders.length === 0 ? (
          <p className="text-sm text-black/50">
            {hasFilters
              ? 'No orders match these filters.'
              : 'No orders have been placed yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto border border-black">
            <table className="w-full text-sm">
              <thead className="border-b border-black">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Date</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Retailer</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Supplier</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Status</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-3 py-2.5 font-mono text-[12px] whitespace-nowrap text-black/60">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-black">
                      {o.retailer?.businessName ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-black">
                      {o.supplier?.businessName ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge label={o.status} tone={orderStatusTone[o.status]} />
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[12px] whitespace-nowrap text-black">
                      ₹{Number(o.totalAmount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || isFetching}
            className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="font-mono text-[11px] uppercase tracking-wide text-black/50">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages || isFetching}
            className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
