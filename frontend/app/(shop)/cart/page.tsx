"use client";

import Link from "next/link";
import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCartShopping,
  FaChevronRight,
  FaCircleExclamation,
  FaHeadset,
  FaLock,
  FaMicrochip,
  FaRotate,
  FaShieldHalved,
  FaTruckFast,
} from "react-icons/fa6";

import CartItemRow from "@/components/cart/CartItemRow";
import { PageLoader } from "@/components/ui/Spinner";
import {
  ApiError,
  cartApi,
  formatPrice,
} from "@/lib/api";
import type { Cart } from "@/types";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const message = (
      error as { message?: unknown }
    ).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export default function CartPage() {
  const [cart, setCart] =
    useState<Cart | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await cartApi.get();

      setCart(data);
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error,
      );

      setCart(null);

      setError(
        getErrorMessage(
          error,
          "Unable to load your shopping cart. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  async function handleUpdateQuantity(
    id: number,
    quantity: number,
  ) {
    if (
      quantity < 1 ||
      updatingId !== null
    ) {
      return;
    }

    setUpdatingId(id);
    setError("");

    try {
  const updatedCart =
    await cartApi.updateItem(
      id,
      quantity,
    );

  setCart(updatedCart);

  // Notify the navbar to refresh the cart count
  window.dispatchEvent(new Event("cart-updated"));
} catch (error) {
      console.error(
        "Unable to update cart item:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to update the product quantity.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(
    id: number,
  ) {
    if (updatingId !== null) {
      return;
    }

    setUpdatingId(id);
    setError("");

try {
  const updatedCart =
    await cartApi.removeItem(id);

  setCart(updatedCart);

  // Notify the navbar to refresh the cart count
  window.dispatchEvent(new Event("cart-updated"));
} catch (error) {
      console.error(
        "Unable to remove cart item:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to remove this product from your cart.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  const isEmpty =
    !cart?.items?.length;

  const itemCount = Number(
    cart?.item_count ?? 0,
  );

  const subtotal = Number(
    cart?.subtotal ?? 0,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f5ff]">
      {/* Technology grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#121358]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#F59E0B]/10 blur-3xl" />

      {/* Page heading */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#121358] via-[#222475] to-[#121358] text-white">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-medium text-white/60"
          >
            <Link
              href="/"
              className="transition hover:text-[#F59E0B]"
            >
              Home
            </Link>

            <FaChevronRight size={9} />

            <span className="text-white">
              Shopping Cart
            </span>
          </nav>

          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B] text-2xl shadow-xl shadow-black/20">
                <FaCartShopping />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F59E0B]">
                  Your selected technology
                </p>

                <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                  Shopping Cart
                </h1>

                <p className="mt-2 text-sm text-white/65">
                  Review your products before
                  proceeding to checkout.
                </p>
              </div>
            </div>

            {!isEmpty && (
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wider text-white/55">
                  Items selected
                </p>

                <p className="mt-1 text-2xl font-black text-[#F59E0B]">
                  {itemCount}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* API error */}
        {error && (
          <div
            role="alert"
            className="mb-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <FaCircleExclamation className="mt-0.5 shrink-0 text-lg" />

              <span className="font-medium">
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void loadCart()}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold transition hover:bg-red-200"
            >
              <FaRotate />
              Retry
            </button>
          </div>
        )}

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
              {/* Cart item list */}
              <section className="min-w-0">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F59E0B]">
                      Selected products
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-[#121358]">
                      Your Cart Items
                    </h2>
                  </div>

                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#121358]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#121358] shadow-sm transition hover:border-[#F59E0B] hover:text-[#F59E0B]"
                  >
                    <FaArrowLeft size={12} />
                    Continue Shopping
                  </Link>
                </div>

                <div className="space-y-4">
                  {cart!.items.map(
                    (item, index) => {
                      const isUpdating =
                        updatingId === item.id;

                      return (
                        <article
                          key={item.id}
                          className={`group relative overflow-hidden rounded-3xl border-2 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#121358]/30 hover:shadow-xl hover:shadow-[#121358]/10 ${
                            isUpdating
                              ? "border-[#F59E0B]"
                              : "border-transparent"
                          }`}
                        >
                          {/* Product number */}
                          <div className="absolute left-3 top-3 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#121358] px-2 text-[10px] font-black text-white shadow-md">
                            {String(
                              index + 1,
                            ).padStart(2, "0")}
                          </div>

                          {/* Decorative corner */}
                          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 overflow-hidden">
                            <div className="absolute -right-12 -top-12 h-24 w-24 rotate-45 bg-gradient-to-br from-[#F59E0B]/20 to-transparent" />
                          </div>

                          {isUpdating && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/65 backdrop-blur-[2px]">
                              <div className="flex items-center gap-3 rounded-full bg-[#121358] px-5 py-3 text-xs font-bold text-white shadow-xl">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#F59E0B]" />

                                Updating cart...
                              </div>
                            </div>
                          )}

                          <CartItemRow
                            item={item}
                            onUpdateQuantity={
                              handleUpdateQuantity
                            }
                            onRemove={
                              handleRemove
                            }
                            updating={
                              isUpdating
                            }
                          />
                        </article>
                      );
                    },
                  )}
                </div>
              </section>

              {/* Summary */}
              <aside className="lg:sticky lg:top-28">
                <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-[#121358]/10">
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#121358] to-[#292c82] px-6 py-7 text-white">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#F59E0B]/20 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
                          Checkout details
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                          Order Summary
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl">
                        <FaMicrochip />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">
                          Items
                        </span>

                        <span className="font-bold text-[#121358]">
                          {itemCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">
                          Shipping
                        </span>

                        <span className="text-right text-xs font-bold text-emerald-600">
                          Calculated at checkout
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">
                          Payment protection
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#121358]">
                          <FaShieldHalved className="text-[#F59E0B]" />
                          Included
                        </span>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    <div className="rounded-2xl bg-[#f4f5ff] p-5">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Subtotal
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Taxes calculated later
                          </p>
                        </div>

                        <p className="text-2xl font-black text-[#F59E0B]">
                          {formatPrice(
                            subtotal,
                          )}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      <FaLock className="relative" />

                      <span className="relative">
                        Proceed to Checkout
                      </span>

                      <FaChevronRight
                        size={11}
                        className="relative transition-transform group-hover:translate-x-1"
                      />
                    </Link>

                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                      <FaShieldHalved className="text-emerald-500" />
                      Secure and protected checkout
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#121358]/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#121358]/10 text-[#121358]">
                      <FaHeadset />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#121358]">
                        Need assistance?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Our support team can help
                        with your order.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="mt-4 block rounded-xl border border-[#121358]/15 py-2.5 text-center text-xs font-bold text-[#121358] transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
                  >
                    Contact Support
                  </Link>
                </div>
              </aside>
            </div>

            <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TrustItem
                icon={<FaTruckFast />}
                title="Fast Delivery"
                description="Reliable delivery service"
              />

              <TrustItem
                icon={<FaShieldHalved />}
                title="Secure Checkout"
                description="Protected order information"
              />

              <TrustItem
                icon={<FaRotate />}
                title="Easy Returns"
                description="Simple return experience"
              />

              <TrustItem
                icon={<FaHeadset />}
                title="Expert Support"
                description="Help whenever needed"
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function EmptyCart() {
  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-white bg-white p-8 text-center shadow-2xl shadow-[#121358]/10 sm:p-14">
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[#121358]/10" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#121358] to-[#32358f] text-4xl text-white shadow-xl">
          <FaBoxOpen />
        </div>

        <span className="absolute -right-1 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-black text-white shadow-lg">
          0
        </span>
      </div>

      <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
        Nothing selected yet
      </p>

      <h2 className="mt-3 text-3xl font-black text-[#121358]">
        Your cart is empty
      </h2>

      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
        Explore our laptops, smartphones,
        accessories and smart devices, then add
        your favorite products to the cart.
      </p>

      <Link
        href="/products"
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-1 hover:shadow-xl"
      >
        <FaMicrochip />
        Explore Products
        <FaChevronRight size={11} />
      </Link>
    </section>
  );
}

type TrustItemProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function TrustItem({
  icon,
  title,
  description,
}: TrustItemProps) {
  return (
    <article className="group flex items-center gap-4 rounded-2xl border-2 border-transparent bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#F59E0B]/40 hover:shadow-lg">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#121358]/10 text-lg text-[#121358] transition group-hover:bg-[#121358] group-hover:text-[#F59E0B]">
        {icon}
      </span>

      <div>
        <h3 className="text-sm font-black text-[#121358]">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}