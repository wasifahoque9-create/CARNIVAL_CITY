"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Badge, { orderStatusVariant } from "@/components/ui/Badge";
import Card, { CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { adminApi, formatPrice, formatOrderNumber } from "@/lib/api";
import type { DashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    { label: "Total Orders", value: stats?.total_orders ?? 0, href: "/admin/orders" },
    { label: "Revenue", value: formatPrice(stats?.total_revenue ?? 0), href: "/admin/orders" },
    { label: "Products", value: stats?.total_products ?? 0, href: "/admin/products" },
    { label: "Pending Reviews", value: stats?.pending_reviews ?? 0, href: "/admin/reviews" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-muted">Overview of your ShopSphere store</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-shadow hover:shadow-md" padding="md">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-primary">{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8" padding="md">
        <CardHeader title="Recent Orders" />
        {!stats?.recent_orders?.length ? (
          <p className="text-sm text-muted">No recent orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-3 pr-4 font-medium">Order</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders`} className="font-medium text-primary hover:text-secondary">
                        {formatOrderNumber(order)}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="py-3 font-semibold text-secondary">
                      {formatPrice(order.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
