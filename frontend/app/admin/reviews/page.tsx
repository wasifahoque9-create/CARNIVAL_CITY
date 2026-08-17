"use client";

import { useEffect, useState } from "react";
import Badge, { orderStatusVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { adminApi } from "@/lib/api";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState<number | null>(null);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await adminApi.reviews.list(1, filterStatus || undefined);
      setReviews(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [filterStatus]);

  async function moderate(id: number, status: "approved" | "hidden") {
    setModeratingId(id);
    try {
      const updated = await adminApi.reviews.moderate(id, status);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } finally {
      setModeratingId(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Reviews</h1>
          <p className="text-muted">Moderate customer reviews</p>
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "hidden", label: "Hidden" },
            { value: "", label: "All" },
          ]}
          className="w-full sm:w-48"
        />
      </div>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <Card padding="md">
            <p className="text-center text-muted">No reviews to show.</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} padding="md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{review.user?.name || "Customer"}</p>
                    <Badge variant={orderStatusVariant(review.status)}>{review.status}</Badge>
                  </div>
                  {review.product && (
                    <p className="text-sm text-muted">Product: {review.product.name}</p>
                  )}
                  <p className="mt-1 text-secondary">{"★".repeat(review.rating)}</p>
                  <p className="mt-1 text-sm text-muted">{review.comment}</p>
                  <p className="mt-2 text-xs text-muted">
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
                {review.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={moderatingId === review.id}
                      onClick={() => moderate(review.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={moderatingId === review.id}
                      onClick={() => moderate(review.id, "hidden")}
                    >
                      Hide
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
