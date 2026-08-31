"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBox,
  FaCheck,
  FaCircleExclamation,
  FaClock,
  FaHouse,
  FaLocationDot,
  FaPhone,
  FaReceipt,
  FaTruckFast,
  FaUser,
} from "react-icons/fa6";
import { ApiError, formatOrderNumber, formatPrice, orderApi } from "@/lib/api";
import type { Order } from "@/types";

const orderSteps = [
  {
    key: "pending",
    label: "Pending",
    icon: FaClock,
  },
  {
    key: "confirmed",
    label: "Accepted",
    icon: FaCheck,
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: FaTruckFast,
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: FaHouse,
  },
];

const deliverySteps = [
  {
    key: "shipped",
    label: "Shipped",
    icon: FaTruckFast,
  },
  {
    key: "in_transit",
    label: "In Transit",
    icon: FaLocationDot,
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    icon: FaClock,
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: FaHouse,
  },
];

function getOrderProgressIndex(status: string): number {
  const normalized = status.toLowerCase();

  if (normalized === "delivered") return 3;
  if (normalized === "shipped") return 2;
  if (normalized === "confirmed") return 1;
  if (normalized === "pending") return 0;

  return -1;
}

function getDeliveryProgressIndex(
  deliveryStatus: string | null | undefined,
  orderStatus: string,
): number {
  const normalized = String(deliveryStatus ?? "").toLowerCase();

  if (normalized === "delivered") return 3;
  if (normalized === "out_for_delivery") return 2;
  if (normalized === "in_transit") return 1;
  if (normalized === "shipped") return 0;

  const normalizedOrderStatus = orderStatus.toLowerCase();

  if (normalizedOrderStatus === "delivered") return 3;
  if (normalizedOrderStatus === "shipped") return 0;

  return -1;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Not updated yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    confirmed: "Accepted",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
  };

  return map[status] ?? status;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedOrderId = useMemo(
    () => orderId.replace(/\D/g, ""),
    [orderId],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedOrderId) {
      setError("Please enter a valid order number.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const result = await orderApi.getGuest(normalizedOrderId);
      setOrder(result);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setError(
            "We could not verify this guest order on this browser. Please use the same browser or device that was used to place the order.",
          );
        } else if (err.status === 404) {
          setError("No order was found with that order number.");
        } else {
          setError(err.message || "Unable to track this order right now.");
        }
      } else {
        setError("Unable to track this order right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#121358] transition hover:text-[#F59E0B]"
          >
            <FaArrowLeft />
            Back to Shop
          </Link>
        </div>
      </section>

      <section className="bg-[#121358]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FBBF24]">
              Guest Order Tracking
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Track Your ShopSphere Order
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Enter your order number below. For security, guest orders can only
              be viewed from the same browser or device that was used during
              checkout.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="order-id"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Order Number
              </label>

              <input
                id="order-id"
                type="text"
                inputMode="numeric"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="Example: 15 or 000015"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#121358] focus:ring-4 focus:ring-[#121358]/10"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F59E0B] px-6 py-3.5 text-sm font-black text-[#121358] transition hover:bg-[#FBBF24] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                <FaLocationDot />
                {loading ? "Tracking..." : "Track Order"}
              </button>
            </div>
          </form>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            You can enter the numeric part of your order number. For example,
            order <strong>#000015</strong> can be searched as{" "}
            <strong>15</strong>.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FaCircleExclamation className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {order && (
          <div className="mt-8 space-y-6">
            <OrderSummary order={order} />

            {order.status !== "cancelled" && (
              <ProgressCard
                title="Order Progress"
                subtitle="Your main order processing status"
                steps={orderSteps}
                activeIndex={getOrderProgressIndex(order.status)}
              />
            )}

            {order.status === "cancelled" && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-black text-red-700">
                  This order has been cancelled.
                </p>
              </div>
            )}

            {order.delivery_method === "home_delivery" &&
              order.status !== "cancelled" && (
                <DeliveryTracking order={order} />
              )}

            <div className="grid gap-6 lg:grid-cols-2">
              <OrderItems order={order} />
              <CustomerAndDeliveryInfo order={order} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-[#121358]">
              {formatOrderNumber(order)}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : order.status === "delivered"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Placed {formatDateTime(order.created_at)}
          </p>
        </div>

        <div className="rounded-2xl bg-[#121358] px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Order Total
          </p>
          <p className="mt-1 text-2xl font-black text-[#FBBF24]">
            {formatPrice(Number(order.total_amount))}
          </p>
        </div>
      </div>
    </section>
  );
}

function ProgressCard({
  title,
  subtitle,
  steps,
  activeIndex,
}: {
  title: string;
  subtitle: string;
  steps: typeof orderSteps;
  activeIndex: number;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <h2 className="text-xl font-black text-[#121358]">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const complete = activeIndex >= index;
          const current = activeIndex === index;

          return (
            <div key={step.key} className="relative">
              <div
                className={`rounded-2xl border p-4 transition ${
                  current
                    ? "border-[#F59E0B] bg-amber-50"
                    : complete
                      ? "border-[#121358]/20 bg-[#121358]/5"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    complete
                      ? "bg-[#121358] text-[#FBBF24]"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Icon />
                </div>

                <p
                  className={`mt-3 text-sm font-black ${
                    complete ? "text-[#121358]" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {current
                    ? "Current status"
                    : complete
                      ? "Completed"
                      : "Waiting"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DeliveryTracking({ order }: { order: Order }) {
  const activeIndex = getDeliveryProgressIndex(
    order.delivery_status,
    order.status,
  );

  if (activeIndex < 0) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
        <h2 className="text-xl font-black text-[#121358]">
          Delivery Tracking
        </h2>
        <p className="mt-2 text-sm font-bold text-amber-800">
          Delivery tracking has not started yet.
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Tracking details will appear here after your order is marked as
          shipped.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#121358]">
            Delivery Tracking
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Follow your package from shipment to delivery.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-[#121358] px-3 py-1.5 text-xs font-black text-[#FBBF24]">
          {getStatusLabel(
            order.delivery_status ??
              (order.status === "delivered" ? "delivered" : "shipped"),
          )}
        </span>
      </div>

      <div className="mt-7">
        <ProgressCardInline activeIndex={activeIndex} />
      </div>

      {(order.delivery_person_name ||
        order.delivery_person_phone ||
        order.tracking_number ||
        order.delivery_note ||
        order.delivery_updated_at) && (
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {order.delivery_person_name && (
            <InfoBox
              icon={FaUser}
              label="Delivery Person"
              value={order.delivery_person_name}
            />
          )}

          {order.delivery_person_phone && (
            <InfoBox
              icon={FaPhone}
              label="Phone"
              value={order.delivery_person_phone}
            />
          )}

          {order.tracking_number && (
            <InfoBox
              icon={FaReceipt}
              label="Tracking Number"
              value={order.tracking_number}
            />
          )}

          {order.delivery_updated_at && (
            <InfoBox
              icon={FaClock}
              label="Last Updated"
              value={formatDateTime(order.delivery_updated_at)}
            />
          )}
        </div>
      )}

      {order.delivery_note && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Delivery Note
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {order.delivery_note}
          </p>
        </div>
      )}
    </section>
  );
}

function ProgressCardInline({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {deliverySteps.map((step, index) => {
        const Icon = step.icon;
        const complete = activeIndex >= index;
        const current = activeIndex === index;

        return (
          <div
            key={step.key}
            className={`rounded-2xl border p-4 ${
              current
                ? "border-[#F59E0B] bg-amber-50"
                : complete
                  ? "border-[#121358]/20 bg-[#121358]/5"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                complete
                  ? "bg-[#121358] text-[#FBBF24]"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <Icon />
            </div>

            <p
              className={`mt-3 text-sm font-black ${
                complete ? "text-[#121358]" : "text-slate-500"
              }`}
            >
              {step.label}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {current ? "Current status" : complete ? "Completed" : "Waiting"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function OrderItems({ order }: { order: Order }) {
  const items = order.items ?? [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121358] text-[#FBBF24]">
          <FaBox />
        </div>

        <div>
          <h2 className="text-lg font-black text-[#121358]">Order Items</h2>
          <p className="text-xs text-slate-500">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-slate-200">
        {items.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">
            No item details are available.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 py-4"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {item.product?.name ?? `Product #${item.product_id}`}
                </p>

                {item.variant && (
                  <p className="mt-1 text-xs text-slate-500">
                    {item.variant.variant_name}: {item.variant.variant_value}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="shrink-0 text-sm font-black text-[#121358]">
                {formatPrice(Number(item.line_total))}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function CustomerAndDeliveryInfo({ order }: { order: Order }) {
  const addressParts = [
    order.guest_address_line1,
    order.guest_address_line2,
    order.guest_city,
    order.guest_postal_code,
    order.guest_country,
  ].filter(Boolean);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-black text-[#121358]">
        Customer & Delivery
      </h2>

      <div className="mt-5 space-y-4">
        <InfoRow label="Customer" value={order.guest_name ?? "Guest Customer"} />

        {order.guest_email && (
          <InfoRow label="Email" value={order.guest_email} />
        )}

        {order.guest_phone && (
          <InfoRow label="Phone" value={order.guest_phone} />
        )}

        <InfoRow
          label="Delivery Method"
          value={
            order.delivery_method === "pickup"
              ? "Pickup from Store"
              : "Home Delivery"
          }
        />

        <InfoRow
          label="Delivery Charge"
          value={formatPrice(Number(order.delivery_charge ?? 0))}
        />

        {order.delivery_method === "home_delivery" &&
          addressParts.length > 0 && (
            <InfoRow label="Delivery Address" value={addressParts.join(", ")} />
          )}
      </div>
    </section>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FaUser;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#121358] shadow-sm">
          <Icon />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-5">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-800 sm:text-right">
        {value}
      </span>
    </div>
  );
}
