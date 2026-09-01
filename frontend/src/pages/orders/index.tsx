import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SearchInput } from '@/components/shared/SearchInput'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useMyOrdersAsRetailer, useMyOrdersAsSupplier, useUpdateOrderStatus } from '@/hooks/useOrder'
import { orderStatusTone } from '@/lib/orderStatusStyles'

export const Route = createFileRoute('/orders/')({
  component: OrdersPage,
})

const PAGE_SIZE = 10
const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

function extractMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    return (error as any).response?.data?.message ?? 'Something went wrong.'
  }
  return 'Something went wrong.'
}

function OrdersPage() {
  const user = useAuthStore((state) => state.user)
  const isSupplier = user?.role === 'SUPPLIER'

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const params = {
    page,
    limit: PAGE_SIZE,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: debouncedSearch || undefined,
  }
  const retailerQuery = useMyOrdersAsRetailer(params)
  const supplierQuery = useMyOrdersAsSupplier(params)
  const { data, isLoading, isFetching } = isSupplier ? supplierQuery : retailerQuery
  const orders = data?.orders ?? []
  const pagination = data?.pagination

  function handleStatusFilterChange(next: StatusFilter) {
    setStatusFilter(next)
    setPage(1)
  }

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState('')

  function handleConfirm(orderId: string) {
    if (!dueDate) {
      toast.error('Please select a due date')
      return
    }
    updateStatus(
      { id: orderId, data: { status: 'CONFIRMED', dueDate } },
      {
        onSuccess: () => {
          toast.success('Order confirmed')
          setConfirmingId(null)
          setDueDate('')
        },
        onError: (err) => toast.error(extractMessage(err)),
      }
    )
  }

  function handleTransition(orderId: string, status: 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    updateStatus(
      { id: orderId, data: { status } },
      {
        onSuccess: () => toast.success(`Order marked as ${status.toLowerCase()}`),
        onError: (err) => toast.error(extractMessage(err)),
      }
    )
  }

  return (
    <PageWrapper>
      <h1 className="font-serif text-2xl font-normal tracking-tight text-black">
        {isSupplier ? 'Received orders' : 'Your orders'}
      </h1>
      <p className="mt-1 text-[13px] text-black/55">
        {isSupplier ? 'Manage orders placed by your retailers.' : 'Track orders you\'ve placed with suppliers.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder={isSupplier ? 'Search by retailer name…' : 'Search by supplier name…'}
        />

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
          className="border border-black/20 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-black"
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {status === 'ALL' ? 'All statuses' : status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <LoadingSpinner label="Loading orders…" />
        ) : orders.length === 0 ? (
          <p className="text-sm text-black/50">
            {debouncedSearch
              ? `No orders match "${debouncedSearch}".`
              : statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} orders.`
                : isSupplier
                  ? 'No orders received yet.'
                  : 'No orders placed yet. Browse suppliers to get started.'}
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const party = isSupplier ? order.retailer : order.supplier
              const isConfirming = confirmingId === order.id

              return (
                <div key={order.id} className="border border-black">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-3">
                    <div>
                      <p className="font-serif text-base text-black">{party?.businessName ?? 'Unknown'}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-black/40">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-serif text-lg text-black">₹{order.totalAmount}</p>
                      <StatusBadge label={order.status} tone={orderStatusTone[order.status]} />
                    </div>
                  </div>

                  <div className="px-5 py-3">
                    <div className="space-y-1">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-[13px] text-black/60">
                          <span>{item.product?.name} × {item.quantity}</span>
                          <span className="font-mono">₹{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.ledgerEntry && (
                      <div className="mt-3 border-t border-black/10 pt-3 font-mono text-[11px] text-black/50">
                        Due {new Date(order.ledgerEntry.dueDate).toLocaleDateString('en-IN')} ·{' '}
                        {order.ledgerEntry.isPaid ? 'Paid' : 'Unpaid'}
                      </div>
                    )}

                    {isSupplier && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/10 pt-4">
                        {order.status === 'PENDING' && !isConfirming && (
                          <>
                            <Button onClick={() => setConfirmingId(order.id)}>Confirm</Button>
                            <Button
                              variant="outline"
                              disabled={isPending}
                              onClick={() => handleTransition(order.id, 'CANCELLED')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        {order.status === 'PENDING' && isConfirming && (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              className="border border-black/20 px-3 py-1.5 text-[12px] outline-none focus:border-black"
                            />
                            <Button disabled={isPending} onClick={() => handleConfirm(order.id)}>
                              {isPending ? 'Confirming…' : 'Set due date & confirm'}
                            </Button>
                            <Button
                              variant="link"
                              onClick={() => { setConfirmingId(null); setDueDate('') }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {order.status === 'CONFIRMED' && (
                          <Button disabled={isPending} onClick={() => handleTransition(order.id, 'SHIPPED')}>
                            Mark as shipped
                          </Button>
                        )}

                        {order.status === 'SHIPPED' && (
                          <Button disabled={isPending} onClick={() => handleTransition(order.id, 'DELIVERED')}>
                            Mark as delivered
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || isFetching}
            className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="font-mono text-[11px] uppercase tracking-wide text-black/50">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} order{pagination.total !== 1 ? 's' : ''}
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
  )
}