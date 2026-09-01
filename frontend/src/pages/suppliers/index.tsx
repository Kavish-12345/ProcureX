import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SearchInput } from '@/components/shared/SearchInput'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useBrowseSuppliers } from '@/hooks/useDiscovery'
import { useMyConnections } from '@/hooks/useConnection'
import type { Supplier, SupplierSummary } from '@/types'

export const Route = createFileRoute('/suppliers/')({
  component: SuppliersPage,
})

function SupplierCard({ supplier }: { supplier: Supplier | SupplierSummary }) {
  return (
    <div className="border border-black p-5">
      <p className="font-serif text-lg text-black">{supplier.businessName}</p>
      <p className="mt-1 text-[13px] text-black/55">{supplier.name}</p>
      <p className="mt-1 font-mono text-[11px] text-black/45">{supplier.phone}</p>
      <Link
        to={`/suppliers/${supplier.id}` as any}
        className="mt-4 block w-full border border-black bg-black py-2 text-center text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
      >
        View products →
      </Link>
    </div>
  )
}

function SuppliersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: browseData, isLoading: isBrowseLoading } = useBrowseSuppliers(debouncedSearch || undefined)
  const allSuppliers = browseData?.suppliers ?? []

  const { data: connectionsData, isLoading: isConnectionsLoading } = useMyConnections()
  const connections = connectionsData?.connections ?? []

  const mySuppliers = connections
    .map((c) => c.supplier)
    .filter((s): s is NonNullable<typeof s> => !!s)

  const mySupplierIds = new Set(mySuppliers.map((s) => s.id))
  const browseSuppliers = allSuppliers.filter((s) => !mySupplierIds.has(s.id))

  return (
    <PageWrapper>
      <div>
        <h1 className="font-serif text-2xl font-normal tracking-tight text-black">
          Suppliers
        </h1>
        <p className="mt-1 text-[13px] text-black/55">
          Browse suppliers and place orders. Suppliers you've completed an order with appear under "My Suppliers."
        </p>
      </div>

      {!isConnectionsLoading && (
        <div className="mt-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black/45">
            My suppliers ({mySuppliers.length})
          </p>
          {mySuppliers.length === 0 ? (
            <p className="mt-3 text-sm text-black/50">
              You haven't completed an order with any supplier yet. Browse suppliers below to get started.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mySuppliers.map((s) => (
                <SupplierCard key={s.id} supplier={s} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-10 border-t border-black/10 pt-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black/45">
          Browse suppliers
        </p>

        <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search suppliers…" className="mt-3" />

        {isBrowseLoading ? (
          <LoadingSpinner label="Loading suppliers…" className="mt-4" />
        ) : browseSuppliers.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">
            {debouncedSearch ? `No suppliers match "${debouncedSearch}".` : 'No more suppliers to browse.'}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {browseSuppliers.map((s) => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}