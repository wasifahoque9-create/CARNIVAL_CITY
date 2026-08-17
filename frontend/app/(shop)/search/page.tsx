"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/products/ProductGrid";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { catalogApi } from "@/lib/api";
import type { Product } from "@/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    catalogApi
      .search(q, page)
      .then((result) => {
        setProducts(result.data);
        setLastPage(result.meta.last_page);
        setTotal(result.meta.total);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">
        {q ? `Results for "${q}"` : "Search"}
      </h1>
      {q && !loading && (
        <p className="mt-2 text-muted">{total} product{total !== 1 ? "s" : ""} found</p>
      )}

      {!q ? (
        <p className="mt-8 text-muted">Enter a search term in the header to find products.</p>
      ) : loading ? (
        <PageLoader />
      ) : (
        <>
          <div className="mt-8">
            <ProductGrid products={products} />
          </div>
          {lastPage > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SearchResults />
    </Suspense>
  );
}
