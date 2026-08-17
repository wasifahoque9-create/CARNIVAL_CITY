"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import {
  adminApi,
  formatPrice,
  getProductImage,
  getProductPrice,
} from "@/lib/api";
import type { Product } from "@/types";

type ProductSort =
  | "created_at"
  | "name"
  | "price"
  | "stock_qty";

type SortDirection = "asc" | "desc";

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const initialPagination: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] =
    useState<ProductSort>("created_at");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");

      try {
        const response = await adminApi.products.list({
          page,
          per_page: 10,
          search: search || undefined,
          status: status || undefined,
          sort_by: sortBy,
          sort_direction: sortDirection,
        });

        setProducts(response.data ?? []);

        setPagination({
          current_page: response.meta?.current_page ?? page,
          last_page: response.meta?.last_page ?? 1,
          per_page: response.meta?.per_page ?? 10,
          total: response.meta?.total ?? 0,
        });
      } catch {
        setProducts([]);
        setError("Products could not be loaded.");
      } finally {
        setLoading(false);
      }
    },
    [search, status, sortBy, sortDirection],
  );

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Archive "${product.name}"? It will no longer appear on the customer website.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setError("");
    setMessage("");

    try {
      await adminApi.products.delete(product.id);

      setMessage(
        `"${product.name}" was archived successfully.`,
      );

      await loadProducts(pagination.current_page);
    } catch {
      setError("The product could not be archived.");
    } finally {
      setDeletingId(null);
    }
  }

  function goToPage(page: number) {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }

    loadProducts(page);
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#121358] sm:text-3xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create, update, and manage products in your store.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button
            variant="secondary"
            className="w-full bg-[#121358] text-white hover:bg-[#1d1e75] sm:w-auto"
          >
            + New Product
          </Button>
        </Link>
      </header>

      {message && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <form
              onSubmit={handleSearch}
              className="flex w-full gap-2 xl:max-w-xl"
            >
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <input
                id="product-search"
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search product name, brand, or SKU..."
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/10"
              />

              <Button type="submit">
                Search
              </Button>

              {(search || searchInput) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="grid gap-3 sm:grid-cols-3">
              <label htmlFor="filter-status" className="sr-only">
                Filter by status
              </label>
              <select
                id="filter-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                aria-label="Filter by status"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#121358]"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <label htmlFor="sort-by" className="sr-only">
                Sort by
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as ProductSort,
                  )
                }
                aria-label="Sort by"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#121358]"
              >
                <option value="created_at">
                  Newest
                </option>
                <option value="name">
                  Product name
                </option>
                <option value="price">
                  Price
                </option>
                <option value="stock_qty">
                  Stock
                </option>
              </select>

              <label htmlFor="sort-direction" className="sr-only">
                Sort direction
              </label>
              <select
                id="sort-direction"
                value={sortDirection}
                onChange={(event) =>
                  setSortDirection(
                    event.target.value as SortDirection,
                  )
                }
                aria-label="Sort direction"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#121358]"
              >
                <option value="desc">
                  Descending
                </option>
                <option value="asc">
                  Ascending
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F2FF] text-2xl text-[#121358]">
              □
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#121358]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add a new product or change your search and filters.
            </p>

            <Link href="/admin/products/new">
              <Button className="mt-5">
                Add Product
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      Product
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Category
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Price
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Stock
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      SKU
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-gray-200 transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex min-w-[250px] items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="h-14 w-14 rounded-xl bg-gray-100 object-cover"
                          />

                          <div>
                            <p className="font-semibold text-[#121358]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {product.brand || "No brand"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {product.category?.name || "—"}
                      </td>

                      <td className="px-4 py-4 font-semibold text-[#F59E0B]">
                        {formatPrice(
                          getProductPrice(product),
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            Number(product.stock_qty) > 10
                              ? "bg-green-50 text-green-700"
                              : Number(product.stock_qty) > 0
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {Number(product.stock_qty) > 0
                            ? `${product.stock_qty} in stock`
                            : "Out of stock"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {product.sku || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            product.status === "active"
                              ? "bg-green-50 text-green-700"
                              : product.status === "draft"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.status || "active"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() =>
                              handleDelete(product)
                            }
                            disabled={
                              deletingId === product.id
                            }
                          >
                            {deletingId === product.id
                              ? "Archiving..."
                              : "Archive"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing {products.length} of{" "}
                {pagination.total} products
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      pagination.current_page - 1,
                    )
                  }
                  disabled={
                    pagination.current_page <= 1
                  }
                  aria-label="Previous page"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="rounded-lg bg-[#121358] px-4 py-2 text-sm font-semibold text-white">
                  {pagination.current_page} /{" "}
                  {pagination.last_page}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      pagination.current_page + 1,
                    )
                  }
                  disabled={
                    pagination.current_page >=
                    pagination.last_page
                  }
                  aria-label="Next page"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </Card>
    </main>
  );
}