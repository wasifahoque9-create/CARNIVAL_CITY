"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";
import { PageLoader } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { catalogApi } from "@/lib/api";
import type { Category, Product } from "@/types";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [appliedFilters, setAppliedFilters] = useState({ minPrice: "", maxPrice: "", sort: "newest" });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const categories = await catalogApi.getCategories();
      const cat =
        categories.find((c) => c.slug === slug) ||
        categories.flatMap((c) => c.children || []).find((c) => c.slug === slug) ||
        null;

      const result = await catalogApi.getCategoryProducts(slug, {
        page,
        min_price: appliedFilters.minPrice ? Number(appliedFilters.minPrice) : undefined,
        max_price: appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : undefined,
      });

      setCategory(cat);
      setProducts(result.data);
      setLastPage(result.meta.last_page);
    } catch {
      setCategory(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug, page, appliedFilters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function applyFilters() {
    setPage(1);
    setAppliedFilters({ minPrice, maxPrice, sort });
  }

  function resetFilters() {
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    setAppliedFilters({ minPrice: "", maxPrice: "", sort: "newest" });
  }

  if (loading && !category) return <PageLoader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {category?.name || slug.replace(/-/g, " ")}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ProductFilters
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onSortChange={setSort}
            onApply={applyFilters}
            onReset={resetFilters}
          />
        </aside>
        <div className="lg:col-span-3">
          {loading ? (
            <PageLoader />
          ) : (
            <>
              <ProductGrid products={products} />
              {lastPage > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
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
      </div>
    </div>
  );
}
