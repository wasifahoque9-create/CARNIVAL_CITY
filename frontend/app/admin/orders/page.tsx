"use client";

import { useEffect, useState } from "react";
import Badge, { orderStatusVariant } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { adminApi, formatPrice, formatOrderNumber } from "@/lib/api";
import type { Order } from "@/types";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const updateOptions = statusOptions.filter((o) => o.value);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await adminApi.orders.list(1, filterStatus || undefined);
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  async function handleStatusChange(orderId: number, status: string) {
    setUpdatingId(orderId);
    try {
      const updated = await adminApi.orders.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Orders</h1>
          <p className="text-muted">Manage customer orders</p>
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={statusOptions}
          className="w-full sm:w-48"
        />
      </div>

      <Card className="mt-8 overflow-hidden" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{formatOrderNumber(order)}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-secondary">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="rounded-lg border border-border px-2 py-1 text-sm"
                      >
                        {updateOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <span className="text-xs text-muted">Saving...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="p-8 text-center text-muted">No orders found.</p>
        )}
      </Card>
    </div>
  );
}
