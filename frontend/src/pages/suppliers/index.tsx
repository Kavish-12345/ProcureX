import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
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

        <div className="relative mt-3 max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search suppliers…"
            className="w-full border border-black/20 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-black"
          />
        </div>

        {isBrowseLoading ? (
          <p className="mt-4 text-sm text-black/50">Loading suppliers…</p>
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