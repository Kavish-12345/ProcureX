import { createFileRoute } from '@tanstack/react-router'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/store/authStore'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const isSupplier = user?.role === 'SUPPLIER'

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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-black p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
            Open orders
          </p>
          <p className="mt-2 font-serif text-3xl text-black">—</p>
        </div>
        <div className="border border-black p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
            Outstanding balance
          </p>
          <p className="mt-2 font-serif text-3xl text-black">—</p>
        </div>
        <div className="border border-black p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
            {isSupplier ? 'Connected retailers' : 'Connected suppliers'}
          </p>
          <p className="mt-2 font-serif text-3xl text-black">—</p>
        </div>
      </div>
    </PageWrapper>
  )
}