"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaBox,
  FaBoxOpen,
  FaCalendarDays,
  FaCheck,
  FaChevronRight,
  FaCircleExclamation,
  FaClock,
  FaCreditCard,
  FaHeadset,
  FaHouse,
  FaLocationDot,
  FaLock,
  FaMicrochip,
  FaReceipt,
  FaRotate,
  FaShieldHalved,
  FaTruckFast,
  FaXmark,
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

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
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

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

function formatTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
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
  status: string,
): string {
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getPaymentMethodLabel(
  method: string | null | undefined,
): string {
  const normalizedMethod = String(
    method ?? "",
  ).toLowerCase();

  if (normalizedMethod === "cod") {
    return "Cash on Delivery";
  }

  if (
    normalizedMethod === "gateway"
  ) {
    return "Online Payment";
  }

  if (!normalizedMethod) {
    return "Not available";
  }

  return normalizedMethod
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getProgressIndex(
  status: string,
): number {
  const normalizedStatus =
    status.toLowerCase();

  if (
    normalizedStatus === "delivered" ||
    normalizedStatus === "completed"
  ) {
    return 4;
  }

  if (
    normalizedStatus === "shipped" ||
    normalizedStatus ===
      "out_for_delivery"
  ) {
    return 3;
  }

  if (
    normalizedStatus === "processing" ||
    normalizedStatus === "packed"
  ) {
    return 2;
  }

  if (
    normalizedStatus === "confirmed" ||
    normalizedStatus === "paid"
  ) {
    return 1;
  }

  if (
    normalizedStatus === "pending"
  ) {
    return 0;
  }

  return -1;
}

/* =========================================================
   ORDER DETAILS PAGE
========================================================= */

export default function OrderDetailPage() {
  const params = useParams();

  const rawId = params.id;

  const id = Array.isArray(rawId)
    ? rawId[0]
    : String(rawId ?? "");

  const {
    user,
    loading: authLoading,
  } = useRequireAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [cancelling, setCancelling] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadOrder =
    useCallback(async () => {
      if (!id) {
        setOrder(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const orderData =
          await orderApi.get(id);

        setOrder(orderData);
      } catch (error) {
        console.error(
          "Unable to load order:",
          error,
        );

        setOrder(null);

        setError(
          getErrorMessage(
            error,
            "Unable to load this order.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    void loadOrder();
  }, [
    authLoading,
    user,
    loadOrder,
  ]);

  async function handleCancel() {
    if (!order || cancelling) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const updatedOrder =
        await orderApi.cancel(id);

      setOrder(updatedOrder);
    } catch (error) {
      console.error(
        "Unable to cancel order:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to cancel this order. It may already be processing.",
        ),
      );
    } finally {
      setCancelling(false);
    }
  }

  const itemCount = useMemo(
    () =>
      order?.items?.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity ?? 0,
          ),
        0,
      ) ?? 0,
    [order],
  );

  const status = order
    ? String(order.status).toLowerCase()
    : "";

  const canCancel =
    Boolean(order) &&
    ["pending", "confirmed"].includes(
      status,
    );

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  if (!order) {
    return (
      <OrderNotFound
        error={error}
        onRetry={() =>
          void loadOrder()
        }
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f5ff]">
      {/* Technology grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="pointer-events-none absolute -left-40 top-72 h-96 w-96 rounded-full bg-[#121358]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#F59E0B]/10 blur-3xl" />

      {/* Order hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#080a3d] via-[#121358] to-[#080a3d] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(73,91,255,0.22)_50%,transparent_51%),linear-gradient(transparent_49%,rgba(73,91,255,0.15)_50%,transparent_51%)] bg-[size:80px_80px]" />
        </div>

        <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
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

            <Link
              href="/orders"
              className="transition hover:text-[#F59E0B]"
            >
              Orders
            </Link>

            <FaChevronRight size={9} />

            <span className="text-white">
              {formatOrderNumber(order)}
            </span>
          </nav>

          <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#F59E0B]/50 bg-[#F59E0B]/10 text-3xl text-[#F59E0B] shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                <FaReceipt />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
                  Order information
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black sm:text-4xl">
                    {formatOrderNumber(order)}
                  </h1>

                  <Badge
                    variant={orderStatusVariant(
                      order.status,
                    )}
                  >
                    {getStatusLabel(
                      String(order.status),
                    )}
                  </Badge>
                </div>

                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65">
                  <span className="inline-flex items-center gap-2">
                    <FaCalendarDays className="text-[#F59E0B]" />

                    {formatDate(
                      order.created_at,
                    )}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <FaClock className="text-[#F59E0B]" />

                    {formatTime(
                      order.created_at,
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm">
              <HeroStat
                label="Products"
                value={String(itemCount)}
              />

              <HeroStat
                label="Order Total"
                value={formatPrice(
                  order.total_amount,
                )}
                emphasized
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error */}
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
                setError("")
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-xs font-bold transition hover:bg-red-200"
            >
              <FaXmark />
              Close
            </button>
          </div>
        )}

        <OrderProgress
          status={status}
        />

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Ordered products */}
          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-[#121358]/5">
            <SectionHeader
              icon={<FaBoxOpen />}
              eyebrow="Purchased products"
              title="Order Items"
              description={`${itemCount} ${
                itemCount === 1
                  ? "item"
                  : "items"
              } included in this order.`}
            />

            <div className="divide-y divide-slate-100 px-5 sm:px-6">
              {order.items?.length ? (
                order.items.map(
                  (item, index) => (
                    <article
                      key={item.id}
                      className="group flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
                    >
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#f4f5ff] to-white text-2xl text-[#121358] shadow-sm">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.04)_1px,transparent_1px)] bg-[size:14px_14px]" />

                        <FaMicrochip className="relative transition-transform group-hover:scale-110" />

                        <span className="absolute right-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[9px] font-black text-white shadow">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F59E0B]">
                          Product{" "}
                          {String(
                            index + 1,
                          ).padStart(2, "0")}
                        </p>

                        <h3 className="mt-1 truncate text-lg font-black text-[#121358]">
                          {item.product?.name ||
                            "Product"}
                        </h3>

                        {item.variant && (
                          <p className="mt-2 text-xs text-slate-500">
                            {
                              item.variant
                                .variant_name
                            }
                            :{" "}
                            {
                              item.variant
                                .variant_value
                            }
                          </p>
                        )}

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Quantity:{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Line Total
                        </p>

                        <p className="mt-1 text-lg font-black text-[#F59E0B]">
                          {formatPrice(
                            item.line_total,
                          )}
                        </p>
                      </div>
                    </article>
                  ),
                )
              ) : (
                <div className="py-12 text-center text-sm text-slate-500">
                  No products were found for
                  this order.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-[#f8f8ff] p-5 sm:p-6">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Final Order Total
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Amount recorded for this
                    purchase
                  </p>
                </div>

                <p className="text-2xl font-black text-[#F59E0B]">
                  {formatPrice(
                    order.total_amount,
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Right column */}
          <aside className="space-y-5 lg:sticky lg:top-28">
            {order.shipping_address && (
              <InfoCard
                icon={
                  <FaLocationDot />
                }
                eyebrow="Delivery destination"
                title="Shipping Address"
              >
                <div className="rounded-xl border border-[#121358]/10 bg-[#f8f8ff] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#121358] text-[#F59E0B]">
                      <FaHouse />
                    </span>

                    <div>
                      <p className="text-sm font-black text-[#121358]">
                        Delivery Address
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {
                          order
                            .shipping_address
                            .line1
                        }

                        {order
                          .shipping_address
                          .line2
                          ? `, ${order.shipping_address.line2}`
                          : ""}

                        <br />

                        {
                          order
                            .shipping_address
                            .city
                        }
                        ,{" "}
                        {
                          order
                            .shipping_address
                            .postal_code
                        }

                        <br />

                        {
                          order
                            .shipping_address
                            .country
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </InfoCard>
            )}

            {order.payment && (
              <InfoCard
                icon={<FaCreditCard />}
                eyebrow="Transaction details"
                title="Payment Information"
              >
                <div className="space-y-3">
                  <DetailRow
                    label="Method"
                    value={getPaymentMethodLabel(
                      order.payment.method,
                    )}
                  />

                  <DetailRow
                    label="Status"
                    value={getStatusLabel(
                      String(
                        order.payment.status,
                      ),
                    )}
                    success={
                      String(
                        order.payment.status,
                      ).toLowerCase() ===
                      "paid"
                    }
                  />

                  {order.payment.amount !=
                    null && (
                    <DetailRow
                      label="Amount"
                      value={formatPrice(
                        order.payment
                          .amount,
                      )}
                      highlighted
                    />
                  )}
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <FaShieldHalved className="mt-0.5 shrink-0 text-emerald-600" />

                  <p className="text-xs leading-5 text-emerald-700">
                    Your payment information is
                    securely associated with this
                    order.
                  </p>
                </div>
              </InfoCard>
            )}

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121358] text-white">
                  <FaHeadset />
                </span>

                <div>
                  <p className="text-xs font-black text-[#121358]">
                    Need help?
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Contact us about this order.
                  </p>
                </div>
              </div>

              <Link
                href="/contact"
                className="shrink-0 rounded-lg border border-[#121358]/20 px-3 py-2 text-xs font-bold text-[#121358] transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
              >
                Get Support
              </Link>
            </div>
          </aside>
        </div>

        {/* Action area */}
        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#121358]/15 px-5 py-3 text-sm font-bold text-[#121358] transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
            >
              <FaArrowLeft />
              Back to All Orders
            </Link>

            {canCancel ? (
              <div className="flex flex-col gap-3 sm:items-end">
                <p className="text-xs text-slate-500">
                  You can cancel while the order
                  is pending or confirmed.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void handleCancel()
                  }
                  disabled={cancelling}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Cancelling Order...
                    </>
                  ) : (
                    <>
                      <FaXmark />
                      Cancel Order
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-[#f4f5ff] px-4 py-3">
                <FaLock className="text-[#121358]" />

                <p className="text-xs font-semibold text-slate-600">
                  This order can no longer be
                  cancelled.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Trust benefits */}
        <section className="mt-8 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <TrustItem
            icon={<FaTruckFast />}
            title="Order Tracking"
            description="Follow delivery progress"
          />

          <TrustItem
            icon={<FaShieldHalved />}
            title="Secure Details"
            description="Protected order information"
          />

          <TrustItem
            icon={<FaReceipt />}
            title="Purchase Record"
            description="Permanent order history"
          />

          <TrustItem
            icon={<FaHeadset />}
            title="Customer Support"
            description="Help whenever needed"
          />
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   ORDER PROGRESS
========================================================= */

const progressSteps = [
  {
    label: "Placed",
    icon: <FaReceipt />,
  },
  {
    label: "Confirmed",
    icon: <FaCheck />,
  },
  {
    label: "Processing",
    icon: <FaBox />,
  },
  {
    label: "Shipped",
    icon: <FaTruckFast />,
  },
  {
    label: "Delivered",
    icon: <FaHouse />,
  },
];

type OrderProgressProps = {
  status: string;
};

function OrderProgress({
  status,
}: OrderProgressProps) {
  const cancelled =
    status === "cancelled" ||
    status === "canceled";

  if (cancelled) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <FaXmark />
          </span>

          <div>
            <h2 className="font-black text-red-700">
              Order Cancelled
            </h2>

            <p className="mt-1 text-sm leading-6 text-red-600">
              This order has been cancelled and
              will not continue through the
              delivery process.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const activeIndex =
    getProgressIndex(status);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F59E0B]">
            Delivery progress
          </p>

          <h2 className="mt-1 text-xl font-black text-[#121358]">
            Order Journey
          </h2>
        </div>

        <Badge
          variant={orderStatusVariant(
            status as Order["status"],
          )}
        >
          {getStatusLabel(status)}
        </Badge>
      </div>

      <div className="relative">
        <div className="absolute left-[8%] right-[8%] top-6 hidden h-1 rounded-full bg-slate-100 sm:block" />

        <div
          className="absolute left-[8%] top-6 hidden h-1 rounded-full bg-gradient-to-r from-[#121358] to-[#F59E0B] transition-all sm:block"
          style={{
            width:
              activeIndex <= 0
                ? "0%"
                : `${
                    (activeIndex /
                      (progressSteps.length -
                        1)) *
                    84
                  }%`,
          }}
        />

        <div className="relative grid gap-4 sm:grid-cols-5">
          {progressSteps.map(
            (step, index) => {
              const completed =
                index <= activeIndex;

              const current =
                index === activeIndex;

              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-xl p-3 sm:flex-col sm:bg-transparent sm:p-0 sm:text-center ${
                    current
                      ? "bg-[#fffaf0]"
                      : "bg-slate-50"
                  }`}
                >
                  <span
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${
                      completed
                        ? "border-[#F59E0B] bg-[#121358] text-[#F59E0B] shadow-lg"
                        : "border-slate-200 bg-white text-slate-300"
                    }`}
                  >
                    {step.icon}
                  </span>

                  <div>
                    <p
                      className={`text-xs font-black ${
                        completed
                          ? "text-[#121358]"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>

                    {current && (
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#F59E0B]">
                        Current
                      </p>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

type HeroStatProps = {
  label: string;
  value: string;
  emphasized?: boolean;
};

function HeroStat({
  label,
  value,
  emphasized = false,
}: HeroStatProps) {
  return (
    <div className="min-w-36 border-r border-white/10 px-5 py-4 text-center last:border-r-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/45">
        {label}
      </p>

      <p
        className={`mt-1 font-black ${
          emphasized
            ? "text-lg text-[#F59E0B]"
            : "text-xl text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type SectionHeaderProps = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-[#f8f8ff] px-5 py-5 sm:px-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#121358] text-xl text-[#F59E0B] shadow-lg">
        {icon}
      </span>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F59E0B]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black text-[#121358]">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

type InfoCardProps = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

function InfoCard({
  icon,
  eyebrow,
  title,
  children,
}: InfoCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#121358]/5">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121358] text-[#F59E0B]">
          {icon}
        </span>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#F59E0B]">
            {eyebrow}
          </p>

          <h2 className="mt-1 font-black text-[#121358]">
            {title}
          </h2>
        </div>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  highlighted?: boolean;
  success?: boolean;
};

function DetailRow({
  label,
  value,
  highlighted = false,
  success = false,
}: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span
        className={`text-right text-sm font-black ${
          highlighted
            ? "text-[#F59E0B]"
            : success
              ? "text-emerald-600"
              : "text-[#121358]"
        }`}
      >
        {value}
      </span>
    </div>
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

/* =========================================================
   ORDER NOT FOUND
========================================================= */

type OrderNotFoundProps = {
  error: string;
  onRetry: () => void;
};

function OrderNotFound({
  error,
  onRetry,
}: OrderNotFoundProps) {
  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-[#f4f5ff] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <section className="relative max-w-xl rounded-[2rem] border border-white bg-white p-9 text-center shadow-2xl shadow-[#121358]/10 sm:p-14">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#121358] to-[#32358f] text-4xl text-white shadow-xl">
          <FaBoxOpen />
        </div>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
          Order unavailable
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#121358]">
          Order not found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          {error ||
            "The order may not exist, or you may not have permission to view it."}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#121358] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#292c82]"
          >
            <FaRotate />
            Try Again
          </button>

          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            <FaArrowLeft />
            Back to Orders
          </Link>
        </div>
      </section>
    </main>
  );
}