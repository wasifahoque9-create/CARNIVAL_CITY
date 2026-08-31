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

  const [searchTerm, setSearchTerm] =
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

  /*
   * Admin search
   *
   * Searches:
   * - Order ID / order number
   * - Customer name
   * - Phone
   * - Email
   * - Address
   * - Area
   * - City
   * - Postal code
   * - Status
   * - Guest / registered
   * - Product name
   * - Product SKU
   */
  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const filteredOrders = orders.filter(
    (order) => {
      if (!normalizedSearch) {
        return true;
      }

      const customerName =
        order.user?.name ??
        order.guest_name ??
        "";

      const customerPhone =
        order.user?.phone ??
        order.guest_phone ??
        "";

      const customerEmail =
        order.user?.email ??
        order.guest_email ??
        "";

      const addressLine1 =
        order.shipping_address?.line1 ??
        order.guest_address_line1 ??
        "";

      const addressLine2 =
        order.shipping_address?.line2 ??
        order.guest_address_line2 ??
        "";

      const city =
        order.shipping_address?.city ??
        order.guest_city ??
        "";

      const area =
        order.guest_area ?? "";

      const postalCode =
        order.shipping_address?.postal_code ??
        order.guest_postal_code ??
        "";

      const customerType =
        order.customer_type ??
        (order.user_id
          ? "registered"
          : "guest");

      const productNames =
        order.items
          ?.map(
            (item) =>
              item.product?.name ?? "",
          )
          .join(" ") ?? "";

      const productSkus =
        order.items
          ?.map(
            (item) =>
              item.product?.sku ?? "",
          )
          .join(" ") ?? "";

      const searchableText = [
        String(order.id),
        formatOrderNumber(order),
        customerName,
        customerPhone,
        customerEmail,
        addressLine1,
        addressLine2,
        city,
        area,
        postalCode,
        order.status,
        customerType,
        productNames,
        productSkus,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch,
      );
    },
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Orders
          </h1>

          <p className="text-muted">
            Manage registered and guest customer
            orders
          </p>
        </div>

        {/* Search + Status filter */}
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search orders..."
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/10"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none text-gray-400 transition hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Status filter */}
          <Select
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(
                event.target.value,
              )
            }
            options={statusOptions}
            className="w-full sm:w-48"
          />
        </div>
      </div>

      {/* Search Result Summary */}
      {searchTerm.trim() && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>
            Found{" "}
            <strong className="text-gray-900">
              {filteredOrders.length}
            </strong>{" "}
            result
            {filteredOrders.length !== 1
              ? "s"
              : ""}
          </span>

          <span>for</span>

          <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-900">
            &quot;{searchTerm}&quot;
          </span>
        </div>
      )}

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
              {filteredOrders.map(
                (order) => {
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
                    order.shipping_address
                      ?.line1 ??
                    order.guest_address_line1 ??
                    "—";

                  const addressLine2 =
                    order.shipping_address
                      ?.line2 ??
                    order.guest_address_line2 ??
                    "";

                  const city =
                    order.shipping_address
                      ?.city ??
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
                    <Fragment
                      key={order.id}
                    >
                      {/* Main Order Row */}
                      <tr className="border-t border-border align-top">
                        {/* Order */}
                        <td className="px-4 py-4 font-medium">
                          {formatOrderNumber(
                            order,
                          )}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">
                            {customerName}
                          </div>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              customerType ===
                              "guest"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {customerType ===
                            "guest"
                              ? "Guest"
                              : "Registered"}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {customerPhone}
                          </div>

                          {customerEmail !==
                            "—" && (
                            <div className="mt-1 max-w-[180px] truncate text-xs text-muted">
                              {
                                customerEmail
                              }
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
                              value={
                                order.status
                              }
                              disabled={
                                updatingId ===
                                order.id
                              }
                              onChange={(
                                event,
                              ) =>
                                void handleStatusChange(
                                  order.id,
                                  event.target
                                    .value,
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
                                    {
                                      option.label
                                    }
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

                      {/* Expanded Full Information */}
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
                                  Customer
                                  Information
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
                                    Products included
                                    in this order
                                  </p>
                                </div>

                                <div className="text-sm font-semibold text-gray-900">
                                  {order.items
                                    ?.length ??
                                    0}{" "}
                                  item
                                  {(order.items
                                    ?.length ??
                                    0) !== 1
                                    ? "s"
                                    : ""}
                                </div>
                              </div>

                              {order.items
                                ?.length ? (
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
                                        (
                                          item,
                                        ) => {
                                          const productImage =
                                            item.product?.images?.find(
                                              (
                                                image,
                                              ) =>
                                                image.is_primary,
                                            ) ??
                                            item
                                              .product
                                              ?.images?.[0];

                                          return (
                                            <tr
                                              key={
                                                item.id
                                              }
                                              className="border-t border-border"
                                            >
                                              {/* Product Image + Name */}
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

                                              {/* Unit Price */}
                                              <td className="whitespace-nowrap px-3 py-4 text-right">
                                                {formatPrice(
                                                  item.unit_price,
                                                )}
                                              </td>

                                              {/* Line Total */}
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
                                          colSpan={
                                            4
                                          }
                                          className="px-3 py-4 text-right font-bold text-gray-900"
                                        >
                                          Order
                                          Total
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

                            {/* Customer Notes */}
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
                },
              )}
            </tbody>
          </table>
        </div>

        {/* Empty Search Result */}
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-medium text-gray-900">
              {searchTerm.trim()
                ? "No matching orders found."
                : "No orders found."}
            </p>

            {searchTerm.trim() && (
              <p className="mt-2 text-sm text-muted">
                Try searching by order number,
                customer name, phone, email,
                location, product, SKU, or
                status.
              </p>
            )}

            {searchTerm.trim() && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                className="mt-4 rounded-lg bg-[#121358] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#222475]"
              >
                Clear Search
              </button>
            )}
          </div>
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
