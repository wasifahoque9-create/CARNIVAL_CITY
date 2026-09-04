"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { API_BASE, catalogApi } from "@/lib/api";
import type { Product } from "@/types";

import ProductCard from "./ProductCard";

type Subcategory = {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
};

type MainCategory = {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
  subcategories?: Subcategory[];
  children?: Subcategory[];
};

type CategoryResponse = {
  data?: MainCategory[] | { data?: MainCategory[] };
};

function extractCategories(
  response: unknown,
): MainCategory[] {
  if (Array.isArray(response)) {
    return response as MainCategory[];
  }

  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    const firstData = (
      response as CategoryResponse
    ).data;

    if (Array.isArray(firstData)) {
      return firstData;
    }

    if (
      firstData &&
      typeof firstData === "object" &&
      "data" in firstData
    ) {
      const secondData = (
        firstData as { data?: unknown }
      ).data;

      if (Array.isArray(secondData)) {
        return secondData as MainCategory[];
      }
    }
  }

  return [];
}

export default function ProductsByCategory() {
  const [categories, setCategories] = useState<
    MainCategory[]
  >([]);

  const [activeCategoryId, setActiveCategoryId] =
    useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>(
    [],
  );

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [productsLoading, setProductsLoading] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * ------------------------------------------------------------
   * Load MAIN categories dynamically
   * ------------------------------------------------------------
   *
   * The backend returns:
   *
   * Main Category
   *    └── subcategories
   *
   * Nothing is hardcoded here.
   */
  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/categories`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ??
              "Categories could not be loaded.",
          );
        }

        const categoryList =
          extractCategories(data);

        /*
         * Only top-level categories are MAIN categories.
         *
         * parent_id === null
         */
        const mainCategories =
          categoryList.filter(
            (category) =>
              category.parent_id === null ||
              category.parent_id === undefined ||
              category.parent_id === 0,
          );

        if (!isMounted) {
          return;
        }

        setCategories(mainCategories);

        /*
         * Automatically select the first main category.
         */
        if (mainCategories.length > 0) {
          setActiveCategoryId(
            (currentId) =>
              currentId ??
              mainCategories[0].id,
          );
        } else {
          setActiveCategoryId(null);
          setProducts([]);
        }
      } catch (categoryError) {
        if (
          categoryError instanceof DOMException &&
          categoryError.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Unable to load categories:",
          categoryError,
        );

        if (isMounted) {
          setCategories([]);
          setActiveCategoryId(null);
          setProducts([]);

          setError(
            categoryError instanceof Error
              ? categoryError.message
              : "Categories could not be loaded.",
          );
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * Currently selected MAIN category
   * ------------------------------------------------------------
   */
  const activeCategory =
    categories.find(
      (category) =>
        category.id === activeCategoryId,
    ) ?? null;

  /*
   * ------------------------------------------------------------
   * Load products for the selected MAIN category
   * ------------------------------------------------------------
   *
   * The backend ProductController already supports:
   *
   * /categories/{main-category-slug}/products
   *
   * and includes products assigned to that main
   * category's subcategories.
   *
   * Therefore we do NOT need to hardcode
   * subcategory slugs here.
   */
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (!activeCategory?.slug) {
        setProducts([]);
        return;
      }

      try {
        setProductsLoading(true);
        setError("");

        const response =
          await catalogApi.getCategoryProducts(
            activeCategory.slug,
            {
              per_page: 6,
            },
          );

        if (isMounted) {
          setProducts(
            response.data?.slice(0, 6) ?? [],
          );
        }
      } catch (productError) {
        console.error(
          "Unable to load products by category:",
          productError,
        );

        if (isMounted) {
          setProducts([]);

          setError(
            "Products could not be loaded.",
          );
        }
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  /*
   * ------------------------------------------------------------
   * Loading state
   * ------------------------------------------------------------
   */
  if (categoriesLoading) {
    return (
      <section className="w-full overflow-hidden bg-[#EEF2FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600 sm:text-sm sm:tracking-[0.35em]">
              Explore Our Technology
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-[#121358] sm:text-4xl">
              Products By Category
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            Loading categories...
          </div>
        </div>
      </section>
    );
  }

  /*
   * ------------------------------------------------------------
   * No main categories
   * ------------------------------------------------------------
   */
  if (categories.length === 0) {
    return (
      <section className="w-full overflow-hidden bg-[#EEF2FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600 sm:text-sm sm:tracking-[0.35em]">
              Explore Our Technology
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-[#121358] sm:text-4xl">
              Products By Category
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-black text-[#121358]">
              No categories available
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Products will appear here when
              categories are added.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden bg-[#EEF2FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600 sm:text-sm sm:tracking-[0.35em]">
              Explore Our Technology
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-[#121358] sm:text-4xl">
              Products By Category
            </h2>
          </div>

          {/* Dynamic category tabs */}
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:max-w-3xl">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setActiveCategoryId(
                      category.id,
                    )
                  }
                  className={`min-w-max flex-1 rounded-xl px-4 py-3 text-center text-sm font-black transition ${
                    activeCategoryId ===
                    category.id
                      ? "bg-[#121358] text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100 hover:text-[#121358]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {/* Active category title */}
        {activeCategory && (
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Products By Category
              </p>

              <h3 className="mt-1 text-2xl font-black text-[#121358]">
                {activeCategory.name}
              </h3>
            </div>
          </div>
        )}

        {/* Products */}
        {productsLoading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            Loading products...
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {activeCategory?.slug && (
              <div className="mt-8 flex justify-center">
                <Link
                  href={`/categories/${activeCategory.slug}`}
                  className="rounded-2xl bg-[#121358] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#F59E0B] hover:text-[#121358]"
                >
                  View More Products
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-black text-[#121358]">
              No products found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add products to the subcategories
              under this category from the admin
              dashboard.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}