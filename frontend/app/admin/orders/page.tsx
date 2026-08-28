"use client";

import {
  useCallback,
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
  formatOrderNumber,
  formatPrice,
} from "@/lib/api";

import type {
  Order,
  OrderStatus,
} from "@/types";

/*
|--------------------------------------------------------------------------
| Status Filter Options
|--------------------------------------------------------------------------
*/

const statusOptions = [
  {
    value: "",
    label: "All Statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "confirmed",
    label: "Accepted",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

/*
|--------------------------------------------------------------------------
| Status Label
|--------------------------------------------------------------------------
*/

function getStatusLabel(
  status: OrderStatus,
): string {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Accepted";

    case "shipped":
      return "Shipped";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

/*
|--------------------------------------------------------------------------
| Delivery Label
|--------------------------------------------------------------------------
*/

function getDeliveryLabel(
  order: Order,
): string {
  return order.delivery_method ===
    "pickup"
    ? "Store Pickup"
    : "Home Delivery";
}

/*
|--------------------------------------------------------------------------
| Error Message
|--------------------------------------------------------------------------
*/

function getErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const message = (
      error as {
        message?: unknown;
      }
    ).message;

    if (
      typeof message === "string"
    ) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}

/*
|--------------------------------------------------------------------------
| Customer Name
|--------------------------------------------------------------------------
|
| Backend customer_name থাকলে সেটাই ব্যবহার করবে।
| Fallback হিসেবে guest_name অথবা user.name ব্যবহার করবে।
|
*/

function getCustomerName(
  order: Order,
): string {
  if (order.customer_name) {
    return order.customer_name;
  }

  if (order.user?.name) {
    return order.user.name;
  }

  if (order.guest_name) {
    return order.guest_name;
  }

  return "Unknown Customer";
}

/*
|--------------------------------------------------------------------------
| Customer Email
|--------------------------------------------------------------------------
*/

function getCustomerEmail(
  order: Order,
): string | null {
  if (order.customer_email) {
    return order.customer_email;
  }

  if (order.user?.email) {
    return order.user.email;
  }

  if (order.guest_email) {
    return order.guest_email;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Customer Type
|--------------------------------------------------------------------------
*/

function getCustomerType(
  order: Order,
): "guest" | "registered" {
  if (
    order.customer_type ===
    "registered"
  ) {
    return "registered";
  }

  if (
    order.customer_type ===
    "guest"
  ) {
    return "guest";
  }

  return order.user_id
    ? "registered"
    : "guest";
}

/*
|--------------------------------------------------------------------------
| Admin Orders Page
|--------------------------------------------------------------------------
*/

export default function AdminOrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    filterStatus,
    setFilterStatus,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<number | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Orders
  |--------------------------------------------------------------------------
  */

  const loadOrders =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await adminApi.orders.list(
            1,
            filterStatus ||
              undefined,
          );

        setOrders(
          response.data ?? [],
        );
      } catch (error) {
        console.error(
          "Unable to load orders:",
          error,
        );

        setError(
          getErrorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    }, [filterStatus]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  /*
  |--------------------------------------------------------------------------
  | Update Status
  |--------------------------------------------------------------------------
  */

  async function handleStatusChange(
    order: Order,
    status: OrderStatus,
  ) {
    /*
     * Ask before cancelling.
     */
    if (
      status === "cancelled"
    ) {
      const confirmed =
        window.confirm(
          `Cancel ${formatOrderNumber(
            order,
          )}?`,
        );

      if (!confirmed) {
        return;
      }
    }

    try {
      setUpdatingId(order.id);
      setError("");

      const updated =
        await adminApi.orders
          .updateStatus(
            order.id,
            status,
          );

      setOrders((current) =>
        current.map(
          (currentOrder) =>
            currentOrder.id ===
            order.id
              ? updated
              : currentOrder,
        ),
      );
    } catch (error) {
      console.error(
        "Unable to update order status:",
        error,
      );

      setError(
        getErrorMessage(error),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      {/* Page Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#121358] sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage customer orders
            and delivery progress.
          </p>
        </div>

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

      {/* Error */}

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold hover:bg-red-200"
          >
            Close
          </button>
        </div>
      )}

      {/* Orders */}

      <Card
        className="mt-8 overflow-hidden"
        padding="none"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">
                  Order
                </th>

                <th className="px-4 py-3 font-medium">
                  Date
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 font-medium">
                  Delivery
                </th>

                <th className="px-4 py-3 font-medium">
                  Delivery Charge
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
              {orders.map(
                (order) => {
                  const updating =
                    updatingId ===
                    order.id;

                  const customerName =
                    getCustomerName(
                      order,
                    );

                  const customerEmail =
                    getCustomerEmail(
                      order,
                    );

                  const customerType =
                    getCustomerType(
                      order,
                    );

                  return (
                    <tr
                      key={order.id}
                      className="border-t border-border align-middle"
                    >
                      {/* Order + Customer */}

                      <td className="px-4 py-4">
                        <div className="min-w-[180px]">
                          {/* Order Number */}

                          <p className="font-black text-[#121358]">
                            {formatOrderNumber(
                              order,
                            )}
                          </p>

                          {/* Customer Name */}

                          <p className="mt-1.5 text-sm font-bold text-gray-800">
                            {customerName}
                          </p>

                          {/* Customer Type */}

                          <div className="mt-1">
                            {customerType ===
                            "registered" ? (
                              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                Registered
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                Guest
                              </span>
                            )}
                          </div>

                          {/* Customer Email */}

                          {customerEmail && (
                            <p
                              className="mt-1 max-w-[190px] truncate text-xs text-muted"
                              title={
                                customerEmail
                              }
                            >
                              {customerEmail}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Date */}

                      <td className="px-4 py-4 text-muted">
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
                          {getStatusLabel(
                            order.status,
                          )}
                        </Badge>
                      </td>

                      {/* Delivery Method */}

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-[#121358]">
                            {getDeliveryLabel(
                              order,
                            )}
                          </p>

                          {order.delivery_method ===
                            "pickup" && (
                            <p className="mt-1 text-xs text-emerald-600">
                              No delivery charge
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Delivery Charge */}

                      <td className="px-4 py-4">
                        {Number(
                          order.delivery_charge ??
                            0,
                        ) > 0 ? (
                          <span className="font-semibold text-[#121358]">
                            {formatPrice(
                              Number(
                                order.delivery_charge,
                              ),
                            )}
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600">
                            Free
                          </span>
                        )}
                      </td>

                      {/* Total */}

                      <td className="px-4 py-4 font-black text-secondary">
                        {formatPrice(
                          Number(
                            order.total_amount,
                          ),
                        )}
                      </td>

                      {/* Actions */}

                      <td className="px-4 py-4">
                        <OrderActions
                          order={order}
                          updating={
                            updating
                          }
                          onStatusChange={
                            handleStatusChange
                          }
                        />
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-10 text-center">
            <p className="font-semibold text-[#121358]">
              No orders found.
            </p>

            <p className="mt-1 text-sm text-muted">
              Orders will appear here
              when customers place them.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Order Action Buttons
|--------------------------------------------------------------------------
*/

function OrderActions({
  order,
  updating,
  onStatusChange,
}: {
  order: Order;

  updating: boolean;

  onStatusChange: (
    order: Order,
    status: OrderStatus,
  ) => Promise<void>;
}) {
  if (updating) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#121358]" />

        Saving...
      </div>
    );
  }

  /*
   * Pending
   *
   * Accept / Cancel
   */
  if (
    order.status ===
    "pending"
  ) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            void onStatusChange(
              order,
              "confirmed",
            )
          }
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
        >
          Accept
        </button>

        <button
          type="button"
          onClick={() =>
            void onStatusChange(
              order,
              "cancelled",
            )
          }
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  /*
   * Accepted
   *
   * Ship / Cancel
   */
  if (
    order.status ===
    "confirmed"
  ) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            void onStatusChange(
              order,
              "shipped",
            )
          }
          className="rounded-lg bg-[#121358] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#292c82]"
        >
          Mark Shipped
        </button>

        <button
          type="button"
          onClick={() =>
            void onStatusChange(
              order,
              "cancelled",
            )
          }
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  /*
   * Shipped
   *
   * Deliver only.
   */
  if (
    order.status ===
    "shipped"
  ) {
    return (
      <button
        type="button"
        onClick={() =>
          void onStatusChange(
            order,
            "delivered",
          )
        }
        className="rounded-lg bg-[#F59E0B] px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
      >
        Mark Delivered
      </button>
    );
  }

  /*
   * Delivered
   */
  if (
    order.status ===
    "delivered"
  ) {
    return (
      <span className="text-xs font-bold text-emerald-600">
        Completed
      </span>
    );
  }

  /*
   * Cancelled
   */
  return (
    <span className="text-xs font-bold text-red-500">
      Cancelled
    </span>
  );
}