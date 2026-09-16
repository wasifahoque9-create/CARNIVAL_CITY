"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Tag,
  ShoppingCart,
  Star,
  Users,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/quotations", label: "Quotations", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/customers", label: "Customers", icon: Users },
  {
    href: "/admin/business-settings",
    label: "Business Settings",
    icon: Tag,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [ordersOpen, setOrdersOpen] = useState(
    pathname.startsWith("/admin/orders"),
  );

  const ordersActive = pathname.startsWith("/admin/orders");

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
    pathname.startsWith(item.href),
  );

  const [categoriesOpen, setCategoriesOpen] =
    useState(categoriesActive);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen((current) => !current)}
        aria-label="Toggle admin menu"
      >
        <Menu size={20} />
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
              className="mt-1 block text-xs text-white/60 transition hover:text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              ← Back to store
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {/* Dashboard, Products, Banners, Quotations */}
            {navItems.slice(0, 4).map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

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
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Categories Dropdown */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  setCategoriesOpen((current) => !current)
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  categoriesActive
                    ? "bg-secondary text-white"
                    : "text-white/80 hover:bg-primary-light hover:text-white"
                }`}
                aria-expanded={categoriesOpen}
              >
                <span className="flex items-center gap-3">
                  <Tag size={18} />
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
                  <Link
                    href="/admin/categories"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === "/admin/categories" ||
                      (pathname.startsWith("/admin/categories/") &&
                        !pathname.startsWith(
                          "/admin/categories/products",
                        ))
                        ? "bg-primary-light text-white"
                        : "text-white/70 hover:bg-primary-light hover:text-white"
                    }`}
                  >
                    Shop by Category
                  </Link>

                  <Link
                    href="/admin/categories/products"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname.startsWith(
                        "/admin/categories/products",
                      )
                        ? "bg-primary-light text-white"
                        : "text-white/70 hover:bg-primary-light hover:text-white"
                    }`}
                  >
                    Products by Category
                  </Link>
                </div>
              )}
            </div>

            {/* Orders Dropdown */}
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
                  <ShoppingCart size={18} />
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
            {navItems
              .slice(5)
              .map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;

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
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}