"use client";

import {
  Fragment,
  useEffect,
  useState,
} from "react";
import Badge, {
  orderStatusVariant,
} from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import {
  adminApi,
  formatPrice,
  formatOrderNumber,
} from "@/lib/api";
import type { Order } from "@/types";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const updateOptions = statusOptions.filter(
  (option) => option.value,
);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [expandedId, setExpandedId] =
    useState<number | null>(null);

  async function loadOrders() {
    setLoading(true);

    try {
      const res = await adminApi.orders.list(
        1,
        filterStatus || undefined,
      );

      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, [filterStatus]);

  async function handleStatusChange(
    orderId: number,
    status: string,
  ) {
    setUpdatingId(orderId);

    try {
      const updated =
        await adminApi.orders.updateStatus(
          orderId,
          status,
        );

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? updated
            : order,
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Orders
          </h1>

          <p className="text-muted">
            Manage registered and guest customer
            orders
          </p>
        </div>

        <Select
          value={filterStatus}
          onChange={(event) =>
            setFilterStatus(event.target.value)
          }
          options={statusOptions}
          className="w-full sm:w-48"
        />
      </div>

      <Card
        className="mt-8 overflow-hidden"
        padding="none"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">
                  Order
                </th>

                <th className="px-4 py-3 font-medium">
                  Customer
                </th>

                <th className="px-4 py-3 font-medium">
                  Phone
                </th>

                <th className="px-4 py-3 font-medium">
                  Location
                </th>

                <th className="px-4 py-3 font-medium">
                  Date
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 font-medium">
                  Total
                </th>

                <th className="px-4 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const customerName =
                  order.user?.name ??
                  order.guest_name ??
                  "Guest Customer";

                const customerPhone =
                  order.user?.phone ??
                  order.guest_phone ??
                  "—";

                const customerEmail =
                  order.user?.email ??
                  order.guest_email ??
                  "—";

                const addressLine1 =
                  order.shipping_address?.line1 ??
                  order.guest_address_line1 ??
                  "—";

                const addressLine2 =
                  order.shipping_address?.line2 ??
                  order.guest_address_line2 ??
                  "";

                const city =
                  order.shipping_address?.city ??
                  order.guest_city ??
                  "—";

                const area =
                  order.guest_area ?? "";

                const postalCode =
                  order.shipping_address
                    ?.postal_code ??
                  order.guest_postal_code ??
                  "—";

                const customerType =
                  order.customer_type ??
                  (order.user_id
                    ? "registered"
                    : "guest");

                const isExpanded =
                  expandedId === order.id;

                return (
                  <Fragment key={order.id}>
                    {/* Main order row */}
                    <tr className="border-t border-border align-top">
                      {/* Order */}
                      <td className="px-4 py-4 font-medium">
                        {formatOrderNumber(order)}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">
                          {customerName}
                        </div>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            customerType === "guest"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {customerType === "guest"
                            ? "Guest"
                            : "Registered"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {customerPhone}
                        </div>

                        {customerEmail !== "—" && (
                          <div className="mt-1 max-w-[180px] truncate text-xs text-muted">
                            {customerEmail}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {area || city}
                        </div>

                        {area &&
                          city &&
                          city !== "—" && (
                            <div className="mt-1 text-xs text-muted">
                              {city}
                            </div>
                          )}
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-4 text-muted">
                        {new Date(
                          order.created_at,
                        ).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge
                          variant={orderStatusVariant(
                            order.status,
                          )}
                        >
                          {order.status}
                        </Badge>
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-secondary">
                        {formatPrice(
                          order.total_amount,
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex min-w-[170px] flex-col gap-2">
                          <select
                            value={order.status}
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(event) =>
                              void handleStatusChange(
                                order.id,
                                event.target.value,
                              )
                            }
                            className="rounded-lg border border-border px-2 py-1.5 text-sm"
                          >
                            {updateOptions.map(
                              (option) => (
                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {option.label}
                                </option>
                              ),
                            )}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(
                                isExpanded
                                  ? null
                                  : order.id,
                              )
                            }
                            className="rounded-lg bg-[#121358] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#222475]"
                          >
                            {isExpanded
                              ? "Hide Details"
                              : "View Details"}
                          </button>

                          {updatingId ===
                            order.id && (
                            <span className="text-xs text-muted">
                              Saving...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded full information */}
                    {isExpanded && (
                      <tr className="border-t border-border bg-gray-50/70">
                        <td
                          colSpan={8}
                          className="px-5 py-6"
                        >
                          <div className="grid gap-6 lg:grid-cols-3">
                            {/* Customer Information */}
                            <section className="rounded-xl border border-border bg-white p-5">
                              <h3 className="text-sm font-bold text-gray-900">
                                Customer Information
                              </h3>

                              <dl className="mt-4 space-y-3 text-sm">
                                <DetailRow
                                  label="Customer Type"
                                  value={
                                    customerType ===
                                    "guest"
                                      ? "Guest Customer"
                                      : "Registered Customer"
                                  }
                                />

                                <DetailRow
                                  label="Full Name"
                                  value={
                                    customerName
                                  }
                                />

                                <DetailRow
                                  label="Phone"
                                  value={
                                    customerPhone
                                  }
                                />

                                <DetailRow
                                  label="Email"
                                  value={
                                    customerEmail
                                  }
                                />
                              </dl>
                            </section>

                            {/* Delivery Information */}
                            <section className="rounded-xl border border-border bg-white p-5">
                              <h3 className="text-sm font-bold text-gray-900">
                                Delivery Address
                              </h3>

                              <dl className="mt-4 space-y-3 text-sm">
                                <DetailRow
                                  label="Address Line 1"
                                  value={
                                    addressLine1
                                  }
                                />

                                <DetailRow
                                  label="Address Line 2"
                                  value={
                                    addressLine2 ||
                                    "—"
                                  }
                                />

                                <DetailRow
                                  label="Area"
                                  value={
                                    area || "—"
                                  }
                                />

                                <DetailRow
                                  label="City"
                                  value={city}
                                />

                                <DetailRow
                                  label="Postal Code"
                                  value={
                                    postalCode
                                  }
                                />
                              </dl>
                            </section>

                            {/* Order Information */}
                            <section className="rounded-xl border border-border bg-white p-5">
                              <h3 className="text-sm font-bold text-gray-900">
                                Order Information
                              </h3>

                              <dl className="mt-4 space-y-3 text-sm">
                                <DetailRow
                                  label="Order"
                                  value={formatOrderNumber(
                                    order,
                                  )}
                                />

                                <DetailRow
                                  label="Status"
                                  value={
                                    order.status
                                  }
                                />

                                <DetailRow
                                  label="Payment Method"
                                  value={
                                    order.payment
                                      ?.method ??
                                    "—"
                                  }
                                />

                                <DetailRow
                                  label="Total"
                                  value={formatPrice(
                                    order.total_amount,
                                  )}
                                />

                                <DetailRow
                                  label="Order Date"
                                  value={new Date(
                                    order.created_at,
                                  ).toLocaleString()}
                                />
                              </dl>
                            </section>
                          </div>

                          {/* Order Items */}
                          <section className="mt-6 rounded-xl border border-border bg-white p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                  Order Items
                                </h3>

                                <p className="mt-1 text-xs text-muted">
                                  Products included in this
                                  order
                                </p>
                              </div>

                              <div className="text-sm font-semibold text-gray-900">
                                {order.items?.length ?? 0}{" "}
                                item
                                {(order.items?.length ??
                                  0) !== 1
                                  ? "s"
                                  : ""}
                              </div>
                            </div>

                            {order.items?.length ? (
                              <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-3 text-left">
                                        Product
                                      </th>

                                      <th className="px-3 py-3 text-left">
                                        Variant
                                      </th>

                                      <th className="px-3 py-3 text-center">
                                        Quantity
                                      </th>

                                      <th className="px-3 py-3 text-right">
                                        Unit Price
                                      </th>

                                      <th className="px-3 py-3 text-right">
                                        Line Total
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {order.items.map(
                                      (item) => {
                                        const productImage =
                                          item.product?.images?.find(
                                            (
                                              image,
                                            ) =>
                                              image.is_primary,
                                          ) ??
                                          item.product
                                            ?.images?.[0];

                                        return (
                                          <tr
                                            key={
                                              item.id
                                            }
                                            className="border-t border-border"
                                          >
                                            {/* Product image + name */}
                                            <td className="px-3 py-4">
                                              <div className="flex min-w-[260px] items-center gap-4">
                                                {productImage?.url ? (
                                                  <img
                                                    src={
                                                      productImage.url
                                                    }
                                                    alt={
                                                      item
                                                        .product
                                                        ?.name ??
                                                      "Ordered product"
                                                    }
                                                    className="h-20 w-20 shrink-0 rounded-xl border border-border bg-white object-cover"
                                                    loading="lazy"
                                                  />
                                                ) : (
                                                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-gray-100 px-2 text-center text-[10px] font-medium text-muted">
                                                    No
                                                    Image
                                                  </div>
                                                )}

                                                <div className="min-w-0">
                                                  <div className="font-semibold text-gray-900">
                                                    {item
                                                      .product
                                                      ?.name ??
                                                      `Product #${item.product_id}`}
                                                  </div>

                                                  {item
                                                    .product
                                                    ?.brand && (
                                                    <div className="mt-1 text-xs text-muted">
                                                      {
                                                        item
                                                          .product
                                                          .brand
                                                      }
                                                    </div>
                                                  )}

                                                  {item
                                                    .product
                                                    ?.sku && (
                                                    <div className="mt-1 text-xs text-muted">
                                                      SKU:{" "}
                                                      {
                                                        item
                                                          .product
                                                          .sku
                                                      }
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </td>

                                            {/* Variant */}
                                            <td className="px-3 py-4 text-muted">
                                              {item.variant
                                                ? `${item.variant.variant_name}: ${item.variant.variant_value}`
                                                : "—"}
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-3 py-4 text-center font-medium">
                                              {
                                                item.quantity
                                              }
                                            </td>

                                            {/* Unit price */}
                                            <td className="whitespace-nowrap px-3 py-4 text-right">
                                              {formatPrice(
                                                item.unit_price,
                                              )}
                                            </td>

                                            {/* Line total */}
                                            <td className="whitespace-nowrap px-3 py-4 text-right font-semibold text-secondary">
                                              {formatPrice(
                                                item.line_total,
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </tbody>

                                  <tfoot>
                                    <tr className="border-t-2 border-border bg-gray-50">
                                      <td
                                        colSpan={4}
                                        className="px-3 py-4 text-right font-bold text-gray-900"
                                      >
                                        Order Total
                                      </td>

                                      <td className="whitespace-nowrap px-3 py-4 text-right text-base font-bold text-secondary">
                                        {formatPrice(
                                          order.total_amount,
                                        )}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            ) : (
                              <p className="mt-3 text-sm text-muted">
                                No order items
                                available.
                              </p>
                            )}
                          </section>

                          {/* Customer notes */}
                          {order.guest_notes && (
                            <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                              <h3 className="text-sm font-bold text-amber-900">
                                Customer Notes
                              </h3>

                              <p className="mt-2 whitespace-pre-wrap text-sm text-amber-800">
                                {
                                  order.guest_notes
                                }
                              </p>
                            </section>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <p className="p-8 text-center text-muted">
            No orders found.
          </p>
        )}
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted">
        {label}
      </dt>

      <dd className="break-words text-right font-medium text-gray-900">
        {value}
      </dd>
    </div>
  );
}