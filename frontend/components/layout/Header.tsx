"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart(); // ✅ shared state, no local fetch needed
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const searchQuery = query.trim();

    if (!searchQuery) return;

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Decorative top line */}
      <div className="h-1 bg-gradient-to-r from-secondary via-white to-secondary" />

      <div className="border-b border-white/10 bg-gradient-to-r from-primary via-primary to-primary-light text-white shadow-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-xl font-black text-white shadow-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              S
            </div>

            <div className="leading-tight">
              <div className="text-xl font-black tracking-tight sm:text-2xl">
                Shop
                <span className="text-secondary">Sphere</span>
              </div>
              <p className="hidden text-[10px] font-medium uppercase tracking-[0.24em] text-white/65 sm:block">
                Smart shopping
              </p>
            </div>
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={handleSearch}
            className="hidden max-w-xl flex-1 items-center rounded-xl bg-white p-1 shadow-lg ring-1 ring-white/20 transition focus-within:ring-2 focus-within:ring-secondary md:flex"
          >
            <div className="flex flex-1 items-center">
              <svg
                className="ml-3 h-5 w-5 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                />
              </svg>

              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search phones, laptops, accessories..."
                className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-secondary-dark active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-secondary"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-secondary"
            >
              About
            </Link>

            <Link
              href="/cart"
              className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-secondary"
            >
              <svg
                className="h-5 w-5 transition-transform group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 3h13m-10 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                />
              </svg>

              <span>Cart</span>

              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                {cartCount}
              </span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/orders"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-secondary"
                >
                  Orders
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>

                  <span className="max-w-24 truncate">
                    {user?.name?.split(" ")[0] || "Profile"}
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-lg border border-secondary/60 bg-secondary/15 px-3 py-2 text-sm font-bold text-secondary transition hover:bg-secondary hover:text-white"
                  >
                    Admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-red-500/20 hover:text-red-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-secondary"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-secondary-dark hover:shadow-xl active:translate-y-0"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="rounded-xl border border-white/15 bg-white/10 p-2.5 text-white transition hover:bg-white/20 lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18 18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-primary/95 px-4 pb-5 pt-4 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="mx-auto max-w-7xl">
              <form
                onSubmit={handleSearch}
                className="mb-5 flex rounded-xl bg-white p-1 shadow-lg"
              >
                <div className="flex flex-1 items-center">
                  <svg
                    className="ml-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                    />
                  </svg>

                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search gadgets..."
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary-dark"
                >
                  Go
                </button>
              </form>

              {isAuthenticated && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-lg font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      {user?.name || "ShopSphere User"}
                    </p>
                    <p className="text-xs text-white/60">
                      {isAdmin ? "Administrator account" : "Customer account"}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <MobileNavLink
                  href="/"
                  label="Home"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileNavLink
                  href="/products"
                  label="Products"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileNavLink
                  href="/about"
                  label="About Us"
                  onClick={() => setMenuOpen(false)}
                />

                <MobileNavLink
                  href="/cart"
                  label="Shopping Cart"
                  onClick={() => setMenuOpen(false)}
                />

                {isAuthenticated ? (
                  <>
                    <MobileNavLink
                      href="/orders"
                      label="My Orders"
                      onClick={() => setMenuOpen(false)}
                    />

                    <MobileNavLink
                      href="/profile"
                      label="My Profile"
                      onClick={() => setMenuOpen(false)}
                    />

                    {isAdmin && (
                      <MobileNavLink
                        href="/admin"
                        label="Admin Dashboard"
                        onClick={() => setMenuOpen(false)}
                        highlighted
                      />
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl bg-secondary px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-secondary-dark"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

type MobileNavLinkProps = {
  href: string;
  label: string;
  onClick: () => void;
  highlighted?: boolean;
};

function MobileNavLink({
  href,
  label,
  onClick,
  highlighted = false,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
        highlighted
          ? "border border-secondary/50 bg-secondary/15 text-secondary hover:bg-secondary hover:text-white"
          : "text-white/90 hover:bg-white/10 hover:text-secondary"
      }`}
    >
      <span>{label}</span>

      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m9 18 6-6-6-6"
        />
      </svg>
    </Link>
  );
}