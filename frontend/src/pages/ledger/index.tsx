import { createFileRoute } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useMyDues, useMyReceivables, useMarkAsPaid } from '@/hooks/useLedger'

export const Route = createFileRoute('/ledger/')({
  component: LedgerPage,
})

function extractMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    return (error as any).response?.data?.message ?? 'Something went wrong.'
  }
  return 'Something went wrong.'
}

function formatCurrency(amount: number | string) {
  return `₹${Number(amount).toFixed(2)}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function LedgerPage() {
  const user = useAuthStore((state) => state.user)
  const isSupplier = user?.role === 'SUPPLIER'

  const duesQuery = useMyDues()
  const receivablesQuery = useMyReceivables()
  const { data, isLoading } = isSupplier ? receivablesQuery : duesQuery
  const entries = data?.entries ?? []

  const { mutate: markAsPaid, isPending, variables } = useMarkAsPaid()

  const unpaidEntries = entries.filter((entry) => !entry.isPaid)
  const totalOutstanding = unpaidEntries.reduce((sum, entry) => sum + Number(entry.amount), 0)

  function handleMarkAsPaid(id: string) {
    markAsPaid(
      { id, data: { paidAt: new Date().toISOString() } },
      {
        onSuccess: () => toast.success('Marked as paid'),
        onError: (err) => toast.error(extractMessage(err)),
      }
    )
  }

  return (
    <PageWrapper>
      <h1 className="font-serif text-2xl font-normal tracking-tight text-black">
        {isSupplier ? 'Receivables' : 'Your dues'}
      </h1>
      <p className="mt-1 text-[13px] text-black/55">
        {isSupplier
          ? 'What your retailers owe you, order by order.'
          : 'What you owe each supplier, order by order.'}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-black p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
            Outstanding balance
          </p>
          <p className="mt-2 font-serif text-3xl text-black">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="border border-black p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
            Unpaid entries
          </p>
          <p className="mt-2 font-serif text-3xl text-black">{unpaidEntries.length}</p>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <LoadingSpinner label="Loading…" />
        ) : entries.length === 0 ? (
          <p className="text-sm text-black/50">{isSupplier ? 'No receivables yet.' : 'No dues yet.'}</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const party = isSupplier ? entry.order.retailer : entry.order.supplier
              const isOverdue = !entry.isPaid && new Date(entry.dueDate) < new Date()
              const isMarking = isPending && variables?.id === entry.id

              return (
                <div key={entry.id} className="border border-black">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-3">
                    <div>
                      <p className="font-serif text-base text-black">{party?.businessName ?? 'Unknown'}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-black/40">
                        Ordered {formatDate(entry.order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-serif text-lg text-black">{formatCurrency(entry.amount)}</p>
                      <StatusBadge
                        label={entry.isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
                        tone={entry.isPaid ? 'filled' : isOverdue ? 'active' : 'neutral'}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <p className="font-mono text-[11px] text-black/50">
                      {entry.isPaid && entry.paidAt ? `Paid on ${formatDate(entry.paidAt)}` : `Due ${formatDate(entry.dueDate)}`}
                    </p>

                    {isSupplier && !entry.isPaid && (
                      <Button disabled={isMarking} onClick={() => handleMarkAsPaid(entry.id)}>
                        {isMarking ? 'Marking…' : 'Mark as paid'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
