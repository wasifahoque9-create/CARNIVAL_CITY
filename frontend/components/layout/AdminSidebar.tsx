"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "📊",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: "📦",
  },
  {
    href: "/admin/banners",
    label: "Banners",
    icon: "🖼️",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: "🏷️",
  },
  {
    href: "/admin/quotations",
    label: "Quotations",
    icon: "📄",
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: "⭐",
  },
  {
    href: "/admin/business-settings",
    label: "Business Settings",
    icon: "⚙️",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(
    pathname.startsWith("/admin/orders"),
  );

  const ordersActive = pathname.startsWith("/admin/orders");

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary p-3 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen((current) => !current)}
        aria-label="Toggle admin menu"
      >
        ☰
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-primary text-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-primary-light px-6 py-5">
            <Link
              href="/admin"
              className="text-lg font-bold"
            >
              Admin Panel
            </Link>

            <Link
              href="/"
              className="mt-1 block text-xs text-white/60 transition hover:text-secondary"
            >
              ← Back to store
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {/* Normal navigation items */}
            {navItems.slice(0, 4).map((item) => {
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
                  <span
                    className="flex h-5 w-5 items-center justify-center"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Orders dropdown */}
            <div>
              <button
                type="button"
                onClick={() =>
                  setOrdersOpen((current) => !current)
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ordersActive
                    ? "bg-secondary text-white"
                    : "text-white/80 hover:bg-primary-light hover:text-white"
                }`}
                aria-expanded={ordersOpen}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 items-center justify-center"
                    aria-hidden="true"
                  >
                    🛒
                  </span>

                  <span>Orders</span>
                </span>

                <span
                  className={`text-xs transition-transform ${
                    ordersOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {ordersOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <Link
                    href="/admin/orders"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === "/admin/orders"
                        ? "bg-secondary/80 text-white"
                        : "text-white/70 hover:bg-primary-light hover:text-white"
                    }`}
                  >
                    Order Details
                  </Link>

                  <Link
                    href="/admin/orders/delivery"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname.startsWith(
                        "/admin/orders/delivery",
                      )
                        ? "bg-secondary/80 text-white"
                        : "text-white/70 hover:bg-primary-light hover:text-white"
                    }`}
                  >
                    Order Delivery
                  </Link>
                </div>
              )}
            </div>

            {/* Remaining navigation items */}
            {navItems.slice(4).map((item) => {
              const active = pathname.startsWith(item.href);

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
                  <span
                    className="flex h-5 w-5 items-center justify-center"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
