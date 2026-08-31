"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  quotationApi,
  type QuotationRequestResponse,
} from "@/lib/api";
import {
  FaDownload,
  FaEye,
  FaSave,
  FaTimes,
} from "react-icons/fa";

type QuotationStatus =
  | "pending"
  | "reviewed"
  | "quoted"
  | "accepted"
  | "rejected";

function formatMoney(
  value: number | string | null | undefined,
): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusLabel(
  status: QuotationStatus,
): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "reviewed":
      return "Reviewed";
    case "quoted":
      return "Quoted";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function getStatusClasses(
  status: QuotationStatus,
): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewed":
      return "bg-blue-100 text-blue-800";
    case "quoted":
      return "bg-purple-100 text-purple-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] =
    useState<QuotationRequestResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [statusFilter, setStatusFilter] =
    useState("");

  const [
    selectedQuotation,
    setSelectedQuotation,
  ] =
    useState<QuotationRequestResponse | null>(
      null,
    );

  const [editStatus, setEditStatus] =
    useState<QuotationStatus>("pending");

  const [quotedAmount, setQuotedAmount] =
    useState("");

  const [adminNote, setAdminNote] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<number | null>(null);

  const loadQuotations =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await quotationApi.adminList(
            page,
            statusFilter || undefined,
          );

        setQuotations(
          response.data ?? [],
        );

        setLastPage(
          Number(
            response.meta?.last_page ?? 1,
          ),
        );

        setTotal(
          Number(
            response.meta?.total ?? 0,
          ),
        );
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(
            "Unable to load quotations.",
          );
        }
      } finally {
        setLoading(false);
      }
    }, [page, statusFilter]);

  useEffect(() => {
    void loadQuotations();
  }, [loadQuotations]);

  async function openQuotation(
    id: number,
  ) {
    try {
      setError("");

      const quotation =
        await quotationApi.adminGet(id);

      setSelectedQuotation(
        quotation,
      );

      setEditStatus(
        quotation.status,
      );

      setQuotedAmount(
        quotation.quoted_amount !==
          null &&
        quotation.quoted_amount !==
          undefined
          ? String(
              quotation.quoted_amount,
            )
          : "",
      );

      setAdminNote(
        quotation.admin_note ?? "",
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Unable to load quotation details.",
        );
      }
    }
  }

  function closeQuotation() {
    if (saving) {
      return;
    }

    setSelectedQuotation(null);
    setQuotedAmount("");
    setAdminNote("");
  }

  async function updateQuotation() {
    if (!selectedQuotation) {
      return;
    }

    const parsedAmount =
      quotedAmount.trim() === ""
        ? null
        : Number(quotedAmount);

    if (
      parsedAmount !== null &&
      (
        !Number.isFinite(parsedAmount) ||
        parsedAmount < 0
      )
    ) {
      setError(
        "Please enter a valid quoted amount.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await quotationApi.adminUpdate(
          selectedQuotation.id,
          {
            status: editStatus,
            quoted_amount:
              parsedAmount,
            admin_note:
              adminNote.trim() || null,
          },
        );

      setSelectedQuotation(
        response.data,
      );

      setEditStatus(
        response.data.status,
      );

      setQuotedAmount(
        response.data.quoted_amount !==
          null &&
        response.data.quoted_amount !==
          undefined
          ? String(
              response.data
                .quoted_amount,
            )
          : "",
      );

      setAdminNote(
        response.data.admin_note ?? "",
      );

      await loadQuotations();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Unable to update quotation.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function downloadQuotation(
    quotationId: number,
  ) {
    try {
      setDownloadingId(
        quotationId,
      );

      setError("");

      await quotationApi.downloadPdf(
        quotationId,
        true,
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Unable to download quotation PDF.",
        );
      }
    } finally {
      setDownloadingId(null);
    }
  }

  function handleFilterChange(
    value: string,
  ) {
    setPage(1);
    setStatusFilter(value);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#121358] md:text-3xl">
              Quotation Requests
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review customer requests,
              set quotation pricing,
              update status and download
              quotation PDFs.
            </p>
          </div>

          <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Quotations
            </p>

            <p className="mt-1 text-2xl font-bold text-[#121358]">
              {total}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="status-filter"
              className="text-sm font-semibold text-gray-700"
            >
              Filter by status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                handleFilterChange(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#121358] sm:w-56"
            >
              <option value="">
                All Quotations
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="reviewed">
                Reviewed
              </option>

              <option value="quoted">
                Quoted
              </option>

              <option value="accepted">
                Accepted
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading quotations...
            </div>
          ) : quotations.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                No quotations found
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                There are no quotation
                requests for this filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#121358]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Quotation
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Customer
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Company
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-white">
                      Estimated
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-white">
                      Quoted
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Date
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {quotations.map(
                    (quotation) => (
                      <tr
                        key={quotation.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#121358]">
                          #
                          {String(
                            quotation.id,
                          ).padStart(
                            6,
                            "0",
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {
                              quotation.customer_name
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              quotation.customer_phone
                            }
                          </p>

                          {quotation.customer_email && (
                            <p className="mt-1 text-xs text-gray-500">
                              {
                                quotation.customer_email
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {quotation.company_name ||
                            "Individual"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-gray-700">
                          {formatMoney(
                            quotation.estimated_total,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-[#121358]">
                          {quotation.quoted_amount !==
                            null &&
                          quotation.quoted_amount !==
                            undefined
                            ? formatMoney(
                                quotation.quoted_amount,
                              )
                            : "—"}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              quotation.status,
                            )}`}
                          >
                            {getStatusLabel(
                              quotation.status,
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                          {formatDate(
                            quotation.created_at,
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void openQuotation(
                                  quotation.id,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-[#121358] px-3 py-2 text-xs font-semibold text-[#121358] transition hover:bg-[#121358] hover:text-white"
                            >
                              <FaEye />
                              View
                            </button>

                            <button
                              type="button"
                              disabled={
                                downloadingId ===
                                quotation.id
                              }
                              onClick={() =>
                                void downloadQuotation(
                                  quotation.id,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-[#F59E0B] px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <FaDownload />

                              {downloadingId ===
                              quotation.id
                                ? "Preparing..."
                                : "PDF"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading &&
            quotations.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          current - 1,
                          1,
                        ),
                    )
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-500">
                  Page {page} of{" "}
                  {lastPage}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= lastPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          current + 1,
                          lastPage,
                        ),
                    )
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
        </div>
      </div>

      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-[#121358]">
                  Quotation #
                  {String(
                    selectedQuotation.id,
                  ).padStart(
                    6,
                    "0",
                  )}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(
                    selectedQuotation.created_at,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={closeQuotation}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
                aria-label="Close quotation"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-6 p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#F59E0B]">
                    Customer
                  </p>

                  <p className="font-bold text-[#121358]">
                    {
                      selectedQuotation.customer_name
                    }
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {
                      selectedQuotation.customer_phone
                    }
                  </p>

                  {selectedQuotation.customer_email && (
                    <p className="mt-1 text-sm text-gray-600">
                      {
                        selectedQuotation.customer_email
                      }
                    </p>
                  )}

                  <p className="mt-2 text-sm text-gray-600">
                    {selectedQuotation.company_name ||
                      "Individual Customer"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#F59E0B]">
                    Quotation Summary
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Estimated Total
                    </span>

                    <strong className="text-[#121358]">
                      {formatMoney(
                        selectedQuotation.estimated_total,
                      )}
                    </strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Quoted Amount
                    </span>

                    <strong className="text-[#121358]">
                      {selectedQuotation.quoted_amount !==
                        null &&
                      selectedQuotation.quoted_amount !==
                        undefined
                        ? formatMoney(
                            selectedQuotation.quoted_amount,
                          )
                        : "Not set"}
                    </strong>
                  </div>
                </div>
              </div>

              {selectedQuotation.message && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#F59E0B]">
                    Customer Message
                  </p>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {
                      selectedQuotation.message
                    }
                  </p>
                </div>
              )}

              <div>
                <h3 className="mb-3 text-base font-bold text-[#121358]">
                  Requested Products
                </h3>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Product
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                          Unit Price
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {selectedQuotation.items?.map(
                        (item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-gray-900">
                                {
                                  item.product_name
                                }
                              </p>

                              {item.variant_name && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {
                                    item.variant_name
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center text-sm text-gray-700">
                              {item.quantity}
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-gray-700">
                              {formatMoney(
                                item.unit_price,
                              )}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-semibold text-[#121358]">
                              {formatMoney(
                                item.line_total,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-4 text-base font-bold text-[#121358]">
                  Admin Quotation
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="quotation-status"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Status
                    </label>

                    <select
                      id="quotation-status"
                      value={editStatus}
                      onChange={(event) =>
                        setEditStatus(
                          event.target
                            .value as QuotationStatus,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-[#121358]"
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="reviewed">
                        Reviewed
                      </option>

                      <option value="quoted">
                        Quoted
                      </option>

                      <option value="accepted">
                        Accepted
                      </option>

                      <option value="rejected">
                        Rejected
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="quoted-amount"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Quoted Amount
                    </label>

                    <input
                      id="quoted-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={quotedAmount}
                      onChange={(event) =>
                        setQuotedAmount(
                          event.target.value,
                        )
                      }
                      placeholder="Enter final quotation amount"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-[#121358]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="admin-note"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Business / Admin Note
                  </label>

                  <textarea
                    id="admin-note"
                    rows={4}
                    value={adminNote}
                    onChange={(event) =>
                      setAdminNote(
                        event.target.value,
                      )
                    }
                    placeholder="Optional note that will appear on the quotation PDF"
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-[#121358]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={
                    downloadingId ===
                    selectedQuotation.id
                  }
                  onClick={() =>
                    void downloadQuotation(
                      selectedQuotation.id,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#121358] px-5 py-3 text-sm font-semibold text-[#121358] transition hover:bg-[#121358] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaDownload />

                  {downloadingId ===
                  selectedQuotation.id
                    ? "Preparing PDF..."
                    : "Download Quotation PDF"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void updateQuotation()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaSave />

                  {saving
                    ? "Saving..."
                    : "Save Quotation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
