"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

import Card, { CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { adminApi, getBannerImage } from "@/lib/api";
import type { Banner } from "@/types";
const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#121358] focus:outline-none focus:ring-1 focus:ring-[#121358]";

type BannerFormState = {
  tag: string;
  title: string;
  highlight: string;
  description: string;
  price: string;
  discount_text: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  fallback_emoji: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm: BannerFormState = {
  tag: "",
  title: "",
  highlight: "",
  description: "",
  price: "",
  discount_text: "",
  cta_text: "Shop Now",
  cta_link: "#shop-by-category",
  secondary_cta_text: "Browse All",
  secondary_cta_link: "/products",
  fallback_emoji: "🛍️",
  sort_order: "0",
  is_active: true,
};

function buildFormData(source: BannerFormState, imageFile: File | null): FormData {
  const payload = new FormData();

  payload.append("tag", source.tag);
  payload.append("title", source.title);
  payload.append("highlight", source.highlight);
  payload.append("description", source.description);
  payload.append("price", source.price);
  payload.append("discount_text", source.discount_text);
  payload.append("cta_text", source.cta_text);
  payload.append("cta_link", source.cta_link);
  payload.append("secondary_cta_text", source.secondary_cta_text);
  payload.append("secondary_cta_link", source.secondary_cta_link);
  payload.append("fallback_emoji", source.fallback_emoji);
  payload.append("sort_order", source.sort_order || "0");
  payload.append("is_active", source.is_active ? "1" : "0");

  if (imageFile) {
    payload.append("image", imageFile);
  }

  return payload;
}

function bannerToFormState(banner: Banner): BannerFormState {
  return {
    tag: banner.tag ?? "",
    title: banner.title,
    highlight: banner.highlight ?? "",
    description: banner.description ?? "",
    price:
      banner.price !== null && banner.price !== undefined
        ? String(banner.price)
        : "",
    discount_text: banner.discount_text ?? "",
    cta_text: banner.cta_text ?? "Shop Now",
    cta_link: banner.cta_link ?? "#shop-by-category",
    secondary_cta_text: banner.secondary_cta_text ?? "Browse All",
    secondary_cta_link: banner.secondary_cta_link ?? "/products",
    fallback_emoji: banner.fallback_emoji || "🛍️",
    sort_order: String(banner.sort_order ?? 0),
    is_active: banner.is_active,
  };
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerFormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.banners.list();
      setBanners(data);
    } catch (err) {
      console.error("Unable to load banners:", err);
      setError("Unable to load banners. Make sure the Laravel API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (banner: Banner) => {
    setEditingId(banner.id);
    setForm(bannerToFormState(banner));
    setImageFile(null);
    setImagePreview(
      getBannerImage({
        image_path:
          banner.image_path ??
          banner.image ??
          banner.image_url ??
          null,
      }),
    );
    setFormError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = buildFormData(form, imageFile);

      if (editingId) {
        await adminApi.banners.update(editingId, payload);
      } else {
        await adminApi.banners.create(payload);
      }

      closeForm();
      await loadBanners();
    } catch (err) {
      console.error("Unable to save banner:", err);
      setFormError("Unable to save banner. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`Delete the banner "${banner.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.banners.delete(banner.id);
      await loadBanners();
    } catch (err) {
      console.error("Unable to delete banner:", err);
      window.alert("Unable to delete this banner. Please try again.");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const payload = buildFormData(
        { ...bannerToFormState(banner), is_active: !banner.is_active },
        null,
      );

      await adminApi.banners.update(banner.id, payload);
      await loadBanners();
    } catch (err) {
      console.error("Unable to update banner status:", err);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Banner Management</h1>
          <p className="mt-1 text-muted">Control the homepage slider without touching any code.</p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-xl bg-[#121358] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#F59E0B]"
        >
          + Add Banner
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <Card className="mt-6" padding="md">
        <CardHeader title={`Banners (${banners.length})`} />

        {banners.length === 0 ? (
          <p className="text-sm text-muted">
            No banners yet. Add your first banner to populate the homepage slider.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-3 pr-4 font-medium">Preview</th>
                  <th className="pb-3 pr-4 font-medium">Title</th>
                  <th className="pb-3 pr-4 font-medium">Order</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => {
                  const imageUrl = getBannerImage({
                    image_path:
                      banner.image_path ??
                      banner.image ??
                      banner.image_url ??
                      null,
                  });

                  return (
                    <tr key={banner.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                          {imageUrl ? (
                            // Plain <img> avoids next/image remote-domain configuration
                            // for a backend-hosted storage URL.
                            <img
                              src={imageUrl}
                              alt={banner.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">{banner.fallback_emoji || "🛍️"}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 pr-4">
                        <p className="font-semibold text-foreground">{banner.title}</p>
                        {banner.tag && <p className="text-xs text-muted">{banner.tag}</p>}
                      </td>

                      <td className="py-3 pr-4">{banner.sort_order}</td>

                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => toggleActive(banner)}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            banner.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {banner.is_active ? "Active" : "Hidden"}
                        </button>
                      </td>

                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(banner)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-[#121358] hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(banner)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#121358]">
                {editingId ? "Edit Banner" : "Add Banner"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="text-2xl leading-none text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tag / badge">
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="Hot Deal"
                    className={inputClass}
                  />
                </Field>

                <Field label="Fallback emoji">
                  <input
                    type="text"
                    value={form.fallback_emoji}
                    onChange={(e) => setForm({ ...form, fallback_emoji: e.target.value })}
                    placeholder="💻"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Power Through Your Day With Pro Laptops"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Highlighted phrase (optional — must match part of the title, shown in amber)">
                <input
                  type="text"
                  value={form.highlight}
                  onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                  placeholder="Pro Laptops"
                  className={inputClass}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price">
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Discount badge text">
                  <input
                    type="text"
                    value={form.discount_text}
                    onChange={(e) => setForm({ ...form, discount_text: e.target.value })}
                    placeholder="Save up to 20%"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Primary button text">
                  <input
                    type="text"
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Primary button link">
                  <input
                    type="text"
                    value={form.cta_link}
                    onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Secondary button text">
                  <input
                    type="text"
                    value={form.secondary_cta_text}
                    onChange={(e) => setForm({ ...form, secondary_cta_text: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Secondary button link">
                  <input
                    type="text"
                    value={form.secondary_cta_link}
                    onChange={(e) => setForm({ ...form, secondary_cta_link: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sort order (lower shows first)">
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <label className="flex items-center gap-2 pt-6 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Show on homepage
                </label>
              </div>

              <Field label="Banner image">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="text-sm"
                />

                {imagePreview && (
                  <div className="mt-3 flex h-32 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </Field>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-foreground hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#121358] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#F59E0B] disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

