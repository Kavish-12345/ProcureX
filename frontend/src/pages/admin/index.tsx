import { createFileRoute } from '@tanstack/react-router';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAdminStats } from '@/hooks/useAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

export const Route = createFileRoute('/admin/')({
  beforeLoad: requireAdmin,
  component: AdminOverviewPage,
});

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-black p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl text-black">{value}</p>
    </div>
  );
}

function AdminOverviewPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <PageWrapper>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
        Admin
      </p>
      <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight">Platform overview</h1>
      <p className="mt-1 text-[13px] text-black/55">
        Totals across every account on ProcureX.
      </p>

      <div className="mt-6">
        {isLoading || !stats ? (
          <LoadingSpinner label="Loading stats…" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Total users" value={stats.totalUsers} />
            <StatTile label="Retailers" value={stats.retailers} />
            <StatTile label="Suppliers" value={stats.suppliers} />
            <StatTile label="Total orders" value={stats.totalOrders} />
            <StatTile label="Pending orders" value={stats.pendingOrders} />
            <StatTile
              label="Outstanding dues"
              value={`₹${Number(stats.outstandingAmount).toFixed(2)}`}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
