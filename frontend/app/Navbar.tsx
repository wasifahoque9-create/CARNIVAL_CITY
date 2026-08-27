"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">

<div className="flex items-center gap-3 px-4 h-20">

 {/* LOGO */}
<Link
  href="/"
  className="flex items-center shrink-0 h-20 w-[140px]"
>
  <img
    src="/CCBM Logo.png"
    alt="CCBM Logo"
    className="w-full h-full object-contain"
  />
</Link>


        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-700 flex-1">

          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/cart">Cart</Link>

          {isAuthenticated && (
            <Link href="/orders">Orders</Link>
          )}

          {isAdmin && (
            <Link href="/admin">Admin</Link>
          )}

        </nav>



        {/* SEARCH - ALWAYS AVAILABLE */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-sm"
        >

          <input
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            type="text"
            placeholder="Search..."
            className="w-full border rounded-lg px-3 py-1 text-sm"
          />

        </form>




        {/* USER */}
        <div className="flex items-center gap-2">

          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="hidden sm:block text-sm"
              >
                {user?.name?.split(" ")[0]}
              </Link>

              <button
                onClick={logout}
                className="hidden sm:block text-sm text-red-500"
              >
                Logout
              </button>
            </>
          ) : (

            <Link
              href="/login"
              className="bg-[#121358] text-white px-3 py-1 rounded-lg text-sm"
            >
              Login
            </Link>

          )}



          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>


        </div>

      </div>





      {/* MOBILE MENU */}
      {menuOpen && (

        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">


          <Link href="/" className="block">
            Home
          </Link>

          <Link href="/shop" className="block">
            Shop
          </Link>

          <Link href="/categories" className="block">
            Categories
          </Link>

          <Link href="/about" className="block">
            About
          </Link>

          <Link href="/contact" className="block">
            Contact
          </Link>

          <Link href="/cart" className="block">
            Cart
          </Link>


          {isAuthenticated && (
            <>
              <Link href="/orders" className="block">
                Orders
              </Link>

              <Link href="/profile" className="block">
                Profile
              </Link>
            </>
          )}


          {isAdmin && (
            <Link href="/admin" className="block">
              Admin
            </Link>
          )}



          {!isAuthenticated ? (
            <Link href="/login" className="block">
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="text-red-500"
            >
              Logout
            </button>
          )}

        </div>

      )}

    </header>
  );
}