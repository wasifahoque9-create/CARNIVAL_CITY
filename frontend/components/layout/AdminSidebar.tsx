"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const categoryPages = [
    {
      href: "/admin/categories",
      label: "Shop by Category",
    },
    {
      href: "/admin/categories/products",
      label: "Products by Category",
    },
  ];

  const categoriesActive = categoryPages.some((item) =>
    pathname.startsWith(item.href)
  );

  const [categoriesOpen, setCategoriesOpen] = useState(categoriesActive);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle admin menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-primary-light px-6 py-5">
            <Link
              href="/admin"
              className="text-lg font-bold"
              onClick={() => setMobileOpen(false)}
            >
              Admin Panel
            </Link>

            <Link
              href="/"
              className="mt-1 block text-xs text-white/60 hover:text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              ← Back to store
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {/* Dashboard, Products, Orders, Reviews */}
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-secondary text-white"
                      : "text-white/80 hover:bg-primary-light hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Categories Dropdown */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  categoriesActive
                    ? "bg-secondary text-white"
                    : "text-white/80 hover:bg-primary-light hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span>🏷️</span>
                  <span>Categories</span>
                </span>

                <span
                  className={`text-xs transition-transform duration-200 ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Category Submenu */}
              {categoriesOpen && (
                <div className="mt-1 space-y-1 pl-9">
                  {/* Shop by Category */}
                  <Link
                    href="/admin/categories"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === "/admin/categories" ||
                      (pathname.startsWith("/admin/categories/") &&
                        !pathname.startsWith(
                          "/admin/categories/products"
                        ))
                        ? "bg-primary-light text-white"
                        : "text-white/70 hover:bg-primary-light hover:text-white"
                    }`}
                  >
                    Shop by Category
                  </Link>

                  {/* Products by Category */}
                  <Link
                    href="/admin/categories/products"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname.startsWith("/admin/categories/products")
                        ? "bg-primary-light text-white"
                        : "text-white/70 hover:bg-primary-light hover:text-white"
                    }`}
                  >
                    Products by Category
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}