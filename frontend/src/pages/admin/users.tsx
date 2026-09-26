import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterSelect } from '@/components/shared/FilterSelect';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useAdminUsers, useSetUserActive } from '@/hooks/useAdmin';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/authStore';
import { extractErrors } from '@/lib/utils';
import { requireAdmin } from '@/lib/requireAdmin';

export const Route = createFileRoute('/admin/users')({
  beforeLoad: requireAdmin,
  component: AdminUsersPage,
});

const PAGE_SIZE = 20;

type RoleFilter = '' | 'RETAILER' | 'SUPPLIER' | 'ADMIN';
type ActiveFilter = '' | 'true' | 'false';

const ROLE_OPTIONS: { label: string; value: RoleFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Retailer', value: 'RETAILER' },
  { label: 'Supplier', value: 'SUPPLIER' },
  { label: 'Admin', value: 'ADMIN' },
];

const ACTIVE_OPTIONS: { label: string; value: ActiveFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Suspended', value: 'false' },
];

function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState<RoleFilter>('');
  const [active, setActive] = useState<ActiveFilter>('');
  const [page, setPage] = useState(1);

  const search = useDebouncedValue(searchInput);

  useEffect(() => {
    setPage(1);
  }, [search, role, active]);

  const { data, isLoading, isFetching } = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role: role || undefined,
    isActive: active === '' ? undefined : active === 'true',
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const hasFilters = Boolean(search || role || active);

  const { mutate: setUserActive, isPending } = useSetUserActive();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleToggle(id: string, isActive: boolean) {
    setPendingId(id);
    setUserActive(
      { id, isActive: !isActive },
      {
        onSuccess: () => toast.success(isActive ? 'Account suspended' : 'Account reactivated'),
        onError: (err) => {
          const { generalMessage } = extractErrors(err, 'Could not update the account');
          toast.error(generalMessage);
        },
        onSettled: () => setPendingId(null),
      },
    );
  }

  return (
    <PageWrapper>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
        Admin
      </p>
      <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight">All users</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name, business, or email…"
          />
          <FilterSelect label="Role" options={ROLE_OPTIONS} value={role} onChange={setRole} />
          <FilterSelect
            label="Status"
            options={ACTIVE_OPTIONS}
            value={active}
            onChange={setActive}
          />
        </div>
        {pagination && (
          <p className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wide text-black/45">
            {pagination.total} user{pagination.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <LoadingSpinner label="Loading users…" />
        ) : users.length === 0 ? (
          <p className="text-sm text-black/50">
            {hasFilters ? 'No users match these filters.' : 'No users yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto border border-black">
            <table className="w-full text-sm">
              <thead className="border-b border-black">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Business</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Name</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Email</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Role</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Status</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td className="px-3 py-2.5 text-[13px] text-black">{u.businessName}</td>
                      <td className="px-3 py-2.5 text-[13px] text-black/70">{u.name}</td>
                      <td className="px-3 py-2.5 text-[13px] text-black/60">{u.email}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] uppercase tracking-wide text-black/60">
                        {u.role}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${
                            u.isActive
                              ? 'border-black/20 text-black/60'
                              : 'border-red-600 text-red-600'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {isSelf ? (
                          <span className="font-mono text-[10px] uppercase tracking-wide text-black/30">
                            You
                          </span>
                        ) : (
                          <Button
                            variant={u.isActive ? 'destructive' : 'default'}
                            size="sm"
                            disabled={isPending && pendingId === u.id}
                            onClick={() => handleToggle(u.id, u.isActive ?? true)}
                          >
                            {u.isActive ? 'Suspend' : 'Reactivate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
