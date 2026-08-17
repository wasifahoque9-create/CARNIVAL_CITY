"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { catalogApi } from "@/lib/api";
import type { Product } from "@/types";

import ProductCard from "./ProductCard";

const tabs = [
  {
    label: "Accessories",
    value: "accessories",
    categorySlugs: ["accessories"],
    viewMoreHref: "/categories/accessories",
  },
  {
    label: "Gadgets",
    value: "gadgets",
    categorySlugs: ["earbuds"],
    viewMoreHref: "/categories/earbuds",
  },
  {
    label: "Smart Devices",
    value: "smart-devices",
    categorySlugs: ["laptops", "mobile-phones", "desktop-pcs", "tablets"],
    viewMoreHref: "/products",
  },
];

export default function ProductsByCategory() {
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const active = tabs.find((item) => item.value === activeTab) ?? tabs[0];

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const responses = await Promise.all(
          active.categorySlugs.map((slug) =>
            catalogApi.getCategoryProducts(slug, {
              per_page: 6,
            }),
          ),
        );

        const mergedProducts = responses
          .flatMap((response) => response.data ?? [])
          .slice(0, 6);

        if (isMounted) {
          setProducts(mergedProducts);
        }
      } catch (error) {
        console.error("Unable to load products by category:", error);

        if (isMounted) {
          setProducts([]);
          setError("Products could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [activeTab, active]);

  return (
    <section className="w-full overflow-hidden bg-[#EEF2FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden">
        <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600 sm:text-sm sm:tracking-[0.35em]">
              Explore Our Technology
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-[#121358] sm:text-4xl">
              Products By Category
            </h2>
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:max-w-2xl">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`w-full rounded-xl px-4 py-3 text-center text-sm font-black transition ${
                    activeTab === tab.value
                      ? "bg-[#121358] text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100 hover:text-[#121358]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            Loading products...
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href={active.viewMoreHref}
                className="rounded-2xl bg-[#121358] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#F59E0B] hover:text-[#121358]"
              >
                View More Products
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-black text-[#121358]">
              No products found
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Add products in this category from admin dashboard.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
