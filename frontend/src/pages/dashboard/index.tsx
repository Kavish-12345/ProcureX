import { createFileRoute, Link } from '@tanstack/react-router'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuthStore } from '@/store/authStore'
import { useMyOrdersAsRetailer, useMyOrdersAsSupplier } from '@/hooks/useOrder'
import { useMyDues, useMyReceivables } from '@/hooks/useLedger'
import { useMyConnections } from '@/hooks/useConnection'
import { orderStatusTone, OPEN_ORDER_STATUSES } from '@/lib/orderStatusStyles'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function formatCurrency(amount: number | string) {
  return `₹${Number(amount).toFixed(2)}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const isSupplier = user?.role === 'SUPPLIER'

  const retailerOrders = useMyOrdersAsRetailer({ limit: 100 })
  const supplierOrders = useMyOrdersAsSupplier({ limit: 100 })
  const { data: orderData, isLoading: ordersLoading } = isSupplier ? supplierOrders : retailerOrders
  const orders = orderData?.orders ?? []

  const duesQuery = useMyDues()
  const receivablesQuery = useMyReceivables()
  const { data: ledgerData, isLoading: ledgerLoading } = isSupplier ? receivablesQuery : duesQuery
  const entries = ledgerData?.entries ?? []

  const { data: connectionData, isLoading: connectionsLoading } = useMyConnections()
  const connections = connectionData?.connections ?? []

  const isLoading = ordersLoading || ledgerLoading || connectionsLoading

  const openOrdersCount = orders.filter((o) => OPEN_ORDER_STATUSES.includes(o.status)).length
  const outstandingBalance = entries
    .filter((e) => !e.isPaid)
    .reduce((sum, e) => sum + Number(e.amount), 0)
  const recentOrders = orders.slice(0, 4)

  return (
    <PageWrapper>
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-normal tracking-tight text-black">
          Welcome back{user?.name ? `, ${user.name}` : ''}.
        </h1>
        <p className="text-[13px] text-black/55">
          {isSupplier
            ? "Here's what's moving through your orders today."
            : "Here's where your ledger stands today."}
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading your dashboard…" className="mt-8" />
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-black p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Open orders
              </p>
              <p className="mt-2 font-serif text-3xl text-black">{openOrdersCount}</p>
            </div>
            <div className="border border-black p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Outstanding balance
              </p>
              <p className="mt-2 font-serif text-3xl text-black">{formatCurrency(outstandingBalance)}</p>
            </div>
            <div className="border border-black p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
                {isSupplier ? 'Connected retailers' : 'Connected suppliers'}
              </p>
              <p className="mt-2 font-serif text-3xl text-black">{connections.length}</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-normal tracking-tight text-black">
                Recent orders
              </h2>
              <Link
                to="/orders"
                className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black/50 underline underline-offset-4 hover:text-black"
              >
                View all →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="mt-4 text-sm text-black/50">
                {isSupplier ? 'No orders received yet.' : 'No orders placed yet.'}
              </p>
            ) : (
              <div className="mt-4 divide-y divide-black/10 border-y border-black/10">
                {recentOrders.map((order) => {
                  const party = isSupplier ? order.retailer : order.supplier
                  return (
                    <div key={order.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-serif text-[15px] text-black">{party?.businessName ?? 'Unknown'}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-black/40">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-mono text-sm text-black">{formatCurrency(order.totalAmount)}</p>
                        <StatusBadge label={order.status} tone={orderStatusTone[order.status]} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </PageWrapper>
  )
}
