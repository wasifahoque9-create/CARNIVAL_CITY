"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card, { CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { adminApi } from "@/lib/api";
import type { Category, CategoryType } from "@/types";

const categoryTypes: { value: CategoryType; label: string }[] = [
  { value: "laptop", label: "Laptop" },
  { value: "pc", label: "PC" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "earbuds", label: "Earbuds" },
  { value: "accessory", label: "Accessory" },
];

type CategoryForm = {
  name: string;
  slug: string;
  type: CategoryType;
  image: File | null;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    slug: "",
    type: "accessory",
    image: null,
  });

  const [saving, setSaving] = useState(false);

  // Image preview for the newly selected image
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function loadCategories() {
    const data = await adminApi.categories.list();
    setCategories(data);
  }

  useEffect(() => {
    loadCategories().finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({
      name: "",
      slug: "",
      type: "accessory",
      image: null,
    });

    setEditingId(null);
    setImagePreview(null);
    setShowForm(false);
  }

  function startEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      image: null,
    });

    setEditingId(cat.id);
    setShowForm(true);

    // Show existing category image when editing
    setImagePreview(cat.image_url ?? null);
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    // Basic frontend validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, JPEG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    // Maximum 4 MB
    if (file.size > 4 * 1024 * 1024) {
      alert("Image size must be less than 4 MB.");
      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      /*
       * Category data is now sent as FormData because an image
       * file needs to be uploaded along with the category information.
       */
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("type", form.type);

      // Only append image when the admin selected one.
      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        await adminApi.categories.update(editingId, formData);
      } else {
        await adminApi.categories.create(formData);
      }

      await loadCategories();
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category?")) return;

    await adminApi.categories.delete(id);

    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Categories
          </h1>

          <p className="text-muted">
            Manage product categories
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Category
        </Button>
      </div>

      {/* Add/Edit category form */}
      {showForm && (
        <Card className="mt-8 max-w-lg" padding="md">
          <CardHeader
            title={editingId ? "Edit Category" : "New Category"}
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category name */}
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-"),
                })
              }
            />

            {/* Category slug */}
            <Input
              label="Slug"
              required
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value,
                })
              }
            />

            {/* Category type */}
            <Select
              label="Type"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as CategoryType,
                })
              }
              options={categoryTypes}
            />

            {/* Category image */}
            <div>
              <label
                htmlFor="category-image"
                className="mb-2 block text-sm font-medium"
              >
                Category Image
              </label>

              <input
                id="category-image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full cursor-pointer rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#121358] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#242675]"
              />

              <p className="mt-1.5 text-xs text-muted">
                JPG, JPEG, PNG or WEBP. Maximum size: 4 MB.
              </p>
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="rounded-xl border border-border bg-gray-50 p-4">
                <p className="mb-3 text-sm font-medium">
                  {form.image
                    ? "Selected Image"
                    : "Current Category Image"}
                </p>

                <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-white">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="h-full w-full object-contain p-3"
                  />
                </div>

                {form.image && (
                  <p className="mt-2 truncate text-xs text-muted">
                    {form.image.name}
                  </p>
                )}
              </div>
            )}

            {/* Form buttons */}
            <div className="flex gap-2">
              <Button
                type="submit"
                loading={saving}
              >
                {editingId ? "Update" : "Create"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Category list */}
      <Card
        className="mt-8 overflow-hidden"
        padding="none"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">
                  Image
                </th>

                <th className="px-4 py-3 font-medium">
                  Name
                </th>

                <th className="px-4 py-3 font-medium">
                  Slug
                </th>

                <th className="px-4 py-3 font-medium">
                  Type
                </th>

                <th className="px-4 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-t border-border"
                >
                  {/* Category image */}
                  <td className="px-4 py-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-2xl">
                          📦
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 font-medium">
                    {cat.name}
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3 text-muted">
                    {cat.slug}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 capitalize">
                    {cat.type}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(cat)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}