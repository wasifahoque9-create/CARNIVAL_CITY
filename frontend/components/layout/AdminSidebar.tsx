"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary p-3 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle admin menu"
      >
        ☰
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-primary text-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-primary-light px-6 py-5">
            <Link href="/admin" className="text-lg font-bold">
              Admin Panel
            </Link>
            <Link
              href="/"
              className="mt-1 block text-xs text-white/60 hover:text-secondary"
            >
              ← Back to store
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
