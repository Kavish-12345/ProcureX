import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useSupplierProducts } from '@/hooks/useProducts'
import { useCreateOrder } from '@/hooks/useOrder'
import type { Product } from '@/types'

export const Route = createFileRoute('/suppliers/$id')({
  component: SupplierDetailPage,
})

const PAGE_SIZE = 15

function extractMessage(error: unknown) {
  if (error && typeof error === 'object' && 'response' in error) {
    return (error as any).response?.data?.message ?? 'Something went wrong.'
  }
  return 'Something went wrong.'
}

function SupplierDetailPage() {
  const { id } = Route.useParams()

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1) // reset to page 1 on new search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isFetching } = useSupplierProducts(id, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  })
  const products = data?.products ?? []
  const pagination = data?.pagination

  // Keyed by product id so items selected on other pages stay in the
  // order summary even after the current page's product list changes.
  const [cart, setCart] = useState<Record<string, { product: Product; quantity: number }>>({})
  const { mutate: createOrder, isPending } = useCreateOrder()

  function setQuantity(product: Product, value: number) {
    const quantity = Math.max(0, Math.min(value, product.stock))
    setCart((prev) => {
      if (quantity === 0) {
        const { [product.id]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [product.id]: { product, quantity } }
    })
  }

  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0)

  function handlePlaceOrder() {
    if (cartItems.length === 0) {
      toast.error('Add at least one product to place an order')
      return
    }
    createOrder(
      {
        supplierId: id,
        items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      },
      {
        onSuccess: () => {
          toast.success('Order placed successfully!')
          setCart({})
        },
        onError: (err) => toast.error(extractMessage(err)),
      }
    )
  }

  return (
    <PageWrapper>
      <h1 className="font-serif text-2xl font-normal tracking-tight text-black">
        Supplier catalog
      </h1>
      <p className="mt-1 text-[13px] text-black/55">
        Select quantities and place your order.
      </p>

      <div className="relative mt-6 max-w-sm">
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
          placeholder="Search products…"
          className="w-full border border-black/20 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-black"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 transition-colors hover:text-black"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* LEFT: product table */}
        <div className="min-w-0">
          <div>
            {isLoading ? (
              <p className="text-sm text-black/50">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-black/50">
                {debouncedSearch ? `No products match "${debouncedSearch}".` : 'This supplier has no products listed yet.'}
              </p>
            ) : (
              <div className="overflow-hidden border border-black">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[7%]" />
                    <col className="w-[33%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[16%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead className="border-b border-black bg-white">
                    <tr>
                      <th className="whitespace-nowrap px-2.5 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">#</th>
                      <th className="whitespace-nowrap px-2.5 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Product</th>
                      <th className="whitespace-nowrap px-2.5 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Price</th>
                      <th className="whitespace-nowrap px-2.5 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Stock</th>
                      <th className="whitespace-nowrap px-2.5 py-2.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Qty</th>
                      <th className="whitespace-nowrap px-2.5 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Sub</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {products.map((p, index) => {
                      const qty = cart[p.id]?.quantity ?? 0
                      const outOfStock = p.stock === 0
                      const rowNumber = (page - 1) * PAGE_SIZE + index + 1
                      return (
                        <tr key={p.id} className={qty > 0 ? 'bg-black/[0.025]' : ''}>
                          <td className="px-2.5 py-2.5 font-mono text-[11px] text-black/40">
                            {String(rowNumber).padStart(2, '0')}
                          </td>
                          <td className="px-2.5 py-2.5">
                            <p className="truncate text-[13px] text-black">{p.name}</p>
                            {p.description && (
                              <p className="mt-0.5 truncate text-[10px] text-black/45">{p.description}</p>
                            )}
                          </td>
                          <td className="px-2.5 py-2.5 font-mono text-[12px] whitespace-nowrap text-black/80">
                            ₹{p.unitPrice}
                            <span className="text-black/40">/{p.unit}</span>
                          </td>
                          <td className="px-2.5 py-2.5 font-mono text-[10px] whitespace-nowrap text-black/50">
                            {outOfStock ? 'Out' : `${p.stock} ${p.unit}`}
                          </td>
                          <td className="px-2.5 py-2.5">
                            <div className="mx-auto flex h-7 w-fit items-stretch border border-black/20">
                              <button
                                onClick={() => setQuantity(p, qty - 1)}
                                disabled={outOfStock}
                                className="flex w-6 items-center justify-center text-xs transition-colors hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="0"
                                max={p.stock}
                                value={qty}
                                disabled={outOfStock}
                                onChange={(e) => setQuantity(p, parseInt(e.target.value, 10) || 0)}
                                className="w-8 border-x border-black/20 text-center text-[11px] outline-none disabled:bg-black/5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() => setQuantity(p, qty + 1)}
                                disabled={outOfStock}
                                className="flex w-6 items-center justify-center text-xs transition-colors hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-2.5 py-2.5 text-right font-mono text-[12px] whitespace-nowrap text-black">
                            {qty > 0 ? `₹${(p.unitPrice * qty).toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || isFetching}
                className="font-mono text-[11px] font-semibold uppercase tracking-wide text-black disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="font-mono text-[11px] uppercase tracking-wide text-black/50">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} product{pagination.total !== 1 ? 's' : ''}
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
        </div>

        {/* RIGHT: order summary, sized to its contents, capped so it never outgrows the table */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex max-h-[calc(100vh-260px)] flex-col border border-black">
            <div className="shrink-0 border-b border-black px-4 py-2.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">
                Order summary
              </p>
            </div>

            {cartItems.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[12px] text-black/40">No items selected yet.</p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-col px-4 py-4">
                <div className="scrollbar-hidden min-h-0 space-y-2.5 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-baseline justify-between text-sm">
                      <span className="truncate pr-2 text-black/70">
                        {item.product.name}
                        <span className="ml-1.5 font-mono text-[11px] text-black/40">× {item.quantity}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[13px] text-black">
                        ₹{(item.product.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 shrink-0 border-t border-black/10 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-black/40">
                    Total · {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                  </p>
                  <p className="mt-0.5 font-serif text-xl text-black">₹{cartTotal.toFixed(2)}</p>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPending}
                    className="mt-4 w-full border border-black bg-black py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? 'Placing…' : 'Place order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}