import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import toast from "react-hot-toast";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SearchInput } from "@/components/shared/SearchInput";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  useMyProducts,
  useCreateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
});

function extractErrors(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as any).response?.data;
    const fieldErrors: Record<string, string[]> = {};
    const properties = data?.errors?.properties;
    if (properties) {
      for (const key in properties) {
        if (properties[key]?.errors?.length) {
          fieldErrors[key] = properties[key].errors;
        }
      }
    }
    const generalMessage =
      Object.keys(fieldErrors).length > 0
        ? (data?.message ?? "Please fix the errors below")
        : (data?.message ?? "Something went wrong.");
    return { fieldErrors, generalMessage };
  }
  return { fieldErrors: {}, generalMessage: "Something went wrong." };
}

const PAGE_SIZE = 20;

function ProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useMyProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  const { mutate: createProduct, isPending, error } = useCreateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");

  const { fieldErrors } = extractErrors(error);

  function resetForm() {
    setName("");
    setDescription("");
    setUnitPrice("");
    setStock("");
    setUnit("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createProduct(
      {
        name,
        description: description || undefined,
        unitPrice: parseFloat(unitPrice),
        stock: parseInt(stock, 10),
        unit,
      },
      {
        onSuccess: () => {
          toast.success("Product added successfully!");
          resetForm();
          setShowForm(false);
        },
        onError: (err) => {
          const { generalMessage } = extractErrors(err);
          toast.error(generalMessage);
        },
      },
    );
  }

  function handleDelete(id: string) {
    deleteProduct(id, {
      onSuccess: () => toast.success("Product deleted"),
      onError: () => toast.error("Failed to delete product"),
    });
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-normal tracking-tight text-black">
            Your products
          </h1>
          <p className="mt-1 text-[13px] text-black/55">
            Manage the catalog retailers see.
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add product"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-3 border border-black p-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm outline-none focus:border-black"
              placeholder="Basmati Rice 25kg"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
              Unit price (₹)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm outline-none focus:border-black"
              placeholder="1200.00"
            />
            {fieldErrors.unitPrice && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.unitPrice[0]}
              </p>
            )}
          </div>

          <div>
            <label className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
              Stock
            </label>
            <input
              required
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm outline-none focus:border-black"
              placeholder="50"
            />
            {fieldErrors.stock && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.stock[0]}
              </p>
            )}
          </div>

          <div>
            <label className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
              Unit
            </label>
            <input
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm outline-none focus:border-black"
              placeholder="bag / kg / box"
            />
            {fieldErrors.unit && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.unit[0]}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
              Description (optional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm outline-none focus:border-black"
              placeholder="Short description"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" size="lg" disabled={isPending} className="sm:w-auto sm:px-8">
              {isPending ? "Adding…" : "Add product"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search products by name…" />
        {pagination && (
          <p className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wide text-black/45">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <LoadingSpinner label="Loading products…" />
        ) : products.length === 0 ? (
          <p className="text-sm text-black/50">
            {debouncedSearch
              ? `No products match "${debouncedSearch}".`
              : "No products yet. Add your first one above."}
          </p>
        ) : (
          <div className="overflow-x-auto border border-black">
            <table className="w-full text-sm">
              <thead className="border-b border-black">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Name</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Unit price</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Unit</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Stock</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Total value</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2.5 text-[13px] text-black">{p.name}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] whitespace-nowrap text-black/80">₹{p.unitPrice}</td>
                    <td className="px-3 py-2.5 text-[13px] text-black/60">{p.unit}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-black/60">{p.stock}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-[12px] whitespace-nowrap text-black">₹{p.totalValue.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                        Delete
                      </Button>
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
            onClick={() =>
              setPage((p) => Math.min(p + 1, pagination.totalPages))
            }
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
