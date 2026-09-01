"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X, Search } from "lucide-react";
import { adminApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { User } from "@/types";

type CustomerFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

const emptyForm: CustomerFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    try {
      const response = await adminApi.customers.list({ page, search });
      setCustomers(response.data);
      setLastPage(response.last_page ?? 1);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openAddModal() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEditModal(customer: User) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      password: "",
      password_confirmation: "",
    });
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFieldErrors({});

    try {
      if (editingCustomer) {
        await adminApi.customers.update(editingCustomer.id, {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
        });
      } else {
        await adminApi.customers.create({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          password_confirmation: form.password_confirmation,
        });
      }

      setModalOpen(false);
      await loadCustomers();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(err.errors).forEach(([field, messages]) => {
          mapped[field] = messages[0];
        });
        setFieldErrors(mapped);
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.customers.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#121358]">Customers</h1>
          <p className="mt-1 text-slate-500">Manage registered customer accounts</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[#121358] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#292c82]"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                loadCustomers();
              }
            }}
            placeholder="Search by name, email, or phone"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Sign-in Method</th>
              <th className="px-5 py-3">Verified</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{customer.name}</td>
                  <td className="px-5 py-3 text-slate-600">{customer.email}</td>
                  <td className="px-5 py-3 text-slate-600">{customer.phone || "—"}</td>
                  <td className="px-5 py-3">
                    {customer.google_id ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        Google
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        Email
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {customer.phone_verified_at ? (
                      <span className="text-green-600">✓ Phone</span>
                    ) : customer.email_verified_at ? (
                      <span className="text-green-600">✓ Email</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(customer.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#121358]"
                        aria-label="Edit customer"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(customer)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-lg text-sm font-bold ${
                p === page ? "bg-[#121358] text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#121358]">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#F59E0B]"
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#F59E0B]"
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Phone (optional)</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01712345678"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#F59E0B]"
                />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
              </div>

              {!editingCustomer && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#F59E0B]"
                    />
                    {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={form.password_confirmation}
                      onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </>
              )}

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#121358] px-4 py-2 text-sm font-bold text-white hover:bg-[#292c82] disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingCustomer ? "Save Changes" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#121358]">Delete customer?</h2>
            <p className="mt-2 text-sm text-slate-500">
              This will permanently delete <span className="font-semibold">{deleteTarget.name}</span> (
              {deleteTarget.email}). This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}