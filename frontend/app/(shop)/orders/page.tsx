"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBagShopping,
  FaCalendarDays,
  FaChevronRight,
  FaCircleExclamation,
  FaClockRotateLeft,
  FaHeadset,
  FaMicrochip,
  FaMoneyBillWave,
  FaReceipt,
  FaRotate,
  FaShieldHalved,
  FaTruckFast,
} from "react-icons/fa6";

import Badge, {
  orderStatusVariant,
} from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useRequireAuth } from "@/lib/auth";
import {
  formatOrderNumber,
  formatPrice,
  orderApi,
} from "@/lib/api";
import type { Order } from "@/types";

/* =========================================================
   HELPERS
========================================================= */

function formatOrderDate(
  dateValue: string,
): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function formatOrderTime(
  dateValue: string,
): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function getStatusLabel(
  status: Order["status"],
): string {
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

/* =========================================================
   ORDER HISTORY PAGE
========================================================= */

export default function OrdersPage() {
  const {
    user,
    loading: authLoading,
  } = useRequireAuth();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadOrders =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await orderApi.list();

        setOrders(response.data ?? []);
      } catch (error) {
        console.error(
          "Unable to load order history:",
          error,
        );

        setOrders([]);

        setError(
          "Unable to load your order history. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    void loadOrders();
  }, [
    authLoading,
    user,
    loadOrders,
  ]);

  const totalSpent = useMemo(
    () =>
      orders.reduce(
        (total, order) =>
          total +
          Number(
            order.total_amount ?? 0,
          ),
        0,
      ),
    [orders],
  );

  const confirmedOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = String(
          order.status,
        ).toLowerCase();

        return [
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "completed",
        ].includes(status);
      }).length,
    [orders],
  );

  const latestOrderDate =
    orders.length > 0
      ? formatOrderDate(
          orders[0].created_at,
        )
      : "No orders";

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f5ff]">
      {/* Technology grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="pointer-events-none absolute -left-40 top-56 h-96 w-96 rounded-full bg-[#121358]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-16 h-96 w-96 rounded-full bg-[#F59E0B]/10 blur-3xl" />

      {/* Page hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#080a3d] via-[#121358] to-[#080a3d] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(73,91,255,0.2)_50%,transparent_51%),linear-gradient(transparent_49%,rgba(73,91,255,0.14)_50%,transparent_51%)] bg-[size:80px_80px]" />
        </div>

        <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
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
              Order History
            </span>
          </nav>

          <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#F59E0B]/50 bg-[#F59E0B]/10 text-3xl text-[#F59E0B] shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                <FaClockRotateLeft />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
                  Purchase activity
                </p>

                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  Order History
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                  View your previous orders,
                  monitor their current status and
                  open complete purchase details.
                </p>
              </div>
            </div>

            {orders.length > 0 && (
              <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm">
                <HeroStat
                  label="Total Orders"
                  value={String(
                    orders.length,
                  )}
                />

                <HeroStat
                  label="Active"
                  value={String(
                    confirmedOrders,
                  )}
                />

                <HeroStat
                  label="Latest"
                  value={latestOrderDate}
                  compact
                />
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
              onClick={() =>
                void loadOrders()
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-xs font-bold transition hover:bg-red-200"
            >
              <FaRotate />
              Retry
            </button>
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <>
            {/* Statistics */}
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={<FaReceipt />}
                label="Orders Placed"
                value={String(
                  orders.length,
                )}
                description="Your complete purchase history"
              />

              <StatCard
                icon={
                  <FaMoneyBillWave />
                }
                label="Total Order Value"
                value={formatPrice(
                  totalSpent,
                )}
                description="Combined value of all orders"
              />

              <StatCard
                icon={<FaTruckFast />}
                label="Active Orders"
                value={String(
                  confirmedOrders,
                )}
                description="Confirmed or in progress"
              />
            </section>

            {/* Heading */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F59E0B]">
                  Your purchases
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#121358] sm:text-3xl">
                  Recent Orders
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Select an order to see its
                  products, payment and delivery
                  information.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#121358]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#121358] shadow-sm transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
              >
                <FaBagShopping />
                Continue Shopping
              </Link>
            </div>

            {/* Orders */}
            <section className="space-y-5">
              {orders.map(
                (order, index) => (
                  <article
                    key={order.id}
                    className="group relative overflow-hidden rounded-[1.75rem] border-2 border-transparent bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#F59E0B]/40 hover:shadow-xl hover:shadow-[#121358]/10"
                  >
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-[#121358] via-[#F59E0B] to-[#121358]" />

                    {/* Decorative corner */}
                    <div className="pointer-events-none absolute right-0 top-1 h-32 w-32 overflow-hidden">
                      <div className="absolute -right-16 -top-16 h-32 w-32 rotate-45 bg-gradient-to-br from-[#F59E0B]/20 to-transparent" />
                    </div>

                    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[80px_1fr_auto] lg:items-center">
                      {/* Order index icon */}
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#121358] to-[#30348e] text-xl font-black text-[#F59E0B] shadow-lg">
                        {String(
                          index + 1,
                        ).padStart(2, "0")}
                      </div>

                      {/* Information */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black text-[#121358]">
                            {formatOrderNumber(
                              order,
                            )}
                          </h3>

                          <Badge
                            variant={orderStatusVariant(
                              order.status,
                            )}
                          >
                            {getStatusLabel(
                              order.status,
                            )}
                          </Badge>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                          <OrderMeta
                            icon={
                              <FaCalendarDays />
                            }
                            label="Order Date"
                            value={formatOrderDate(
                              order.created_at,
                            )}
                          />

                          <OrderMeta
                            icon={
                              <FaClockRotateLeft />
                            }
                            label="Order Time"
                            value={
                              formatOrderTime(
                                order.created_at,
                              ) ||
                              "Unavailable"
                            }
                          />

                          <OrderMeta
                            icon={
                              <FaMoneyBillWave />
                            }
                            label="Order Total"
                            value={formatPrice(
                              order.total_amount,
                            )}
                            highlighted
                          />
                        </div>
                      </div>

                      {/* Action */}
                      <Link
                        href={`/orders/${order.id}`}
                        className="group/button relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#121358] to-[#292c82] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#121358]/15 transition hover:-translate-y-0.5 hover:shadow-xl lg:w-auto"
                      >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/button:translate-x-full" />

                        <FaReceipt className="relative" />

                        <span className="relative">
                          View Details
                        </span>

                        <FaChevronRight
                          size={11}
                          className="relative transition-transform group-hover/button:translate-x-1"
                        />
                      </Link>
                    </div>

                    {/* Footer status message */}
                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <p className="flex items-center gap-2 text-slate-500">
                        <FaShieldHalved className="text-emerald-500" />
                        Order information is securely
                        stored in your account.
                      </p>

                      <p className="font-semibold text-[#121358]">
                        Status:{" "}
                        <span className="text-[#F59E0B]">
                          {getStatusLabel(
                            order.status,
                          )}
                        </span>
                      </p>
                    </div>
                  </article>
                ),
              )}
            </section>

            {/* Benefits */}
            <section className="mt-10 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              <TrustItem
                icon={<FaTruckFast />}
                title="Order Tracking"
                description="Follow your order status"
              />

              <TrustItem
                icon={
                  <FaShieldHalved />
                }
                title="Secure Purchases"
                description="Protected order information"
              />

              <TrustItem
                icon={<FaReceipt />}
                title="Order Records"
                description="Access purchase details"
              />

              <TrustItem
                icon={<FaHeadset />}
                title="Customer Support"
                description="Help with your orders"
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   HERO STAT
========================================================= */

type HeroStatProps = {
  label: string;
  value: string;
  compact?: boolean;
};

function HeroStat({
  label,
  value,
  compact = false,
}: HeroStatProps) {
  return (
    <div className="min-w-28 border-r border-white/10 px-4 py-3 text-center last:border-r-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/45">
        {label}
      </p>

      <p
        className={`mt-1 font-black text-[#F59E0B] ${
          compact
            ? "text-xs"
            : "text-xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
};

function StatCard({
  icon,
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <article className="group flex items-center gap-4 rounded-2xl border-2 border-transparent bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#F59E0B]/40 hover:shadow-lg">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#121358]/10 text-xl text-[#121358] transition group-hover:bg-[#121358] group-hover:text-[#F59E0B]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xl font-black text-[#121358]">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   ORDER META
========================================================= */

type OrderMetaProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlighted?: boolean;
};

function OrderMeta({
  icon,
  label,
  value,
  highlighted = false,
}: OrderMetaProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3">
      <span
        className={`mt-0.5 ${
          highlighted
            ? "text-[#F59E0B]"
            : "text-[#121358]"
        }`}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 truncate text-sm font-black ${
            highlighted
              ? "text-[#F59E0B]"
              : "text-[#121358]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY ORDERS
========================================================= */

function EmptyOrders() {
  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-white bg-white p-8 text-center shadow-2xl shadow-[#121358]/10 sm:p-14">
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[#121358]/10" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#121358] to-[#32358f] text-4xl text-white shadow-xl">
          <FaReceipt />
        </div>

        <span className="absolute -right-1 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-black text-white shadow-lg">
          0
        </span>
      </div>

      <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
        No purchase activity
      </p>

      <h2 className="mt-3 text-3xl font-black text-[#121358]">
        No orders yet
      </h2>

      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
        You have not placed any orders yet.
        Explore our latest gadgets and start
        your ShopSphere shopping experience.
      </p>

      <Link
        href="/products"
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-1 hover:shadow-xl"
      >
        <FaBagShopping />
        Start Shopping
        <FaChevronRight size={11} />
      </Link>
    </section>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

type TrustItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function TrustItem({
  icon,
  title,
  description,
}: TrustItemProps) {
  return (
    <article className="group flex items-center gap-4 border-b border-slate-200 p-5 transition hover:bg-[#f8f8ff] sm:border-r lg:border-b-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#121358]/10 bg-white text-lg text-[#121358] transition group-hover:bg-[#121358] group-hover:text-[#F59E0B]">
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