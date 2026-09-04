"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";

type Subcategory = {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
};

type MainCategory = {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
  subcategories?: Subcategory[];
};

type CategoryForm = {
  name: string;
  slug: string;
};

export default function ProductsByCategoryPage() {
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<MainCategory | null>(null);

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    slug: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Load MAIN categories only.
   *
   * Main Category:
   * parent_id === null
   *
   * Shop by Category:
   * parent_id !== null
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.categories.list();

      const data = Array.isArray(response)
        ? response
        : [];

      const mainCategories = data.filter(
        (category) =>
          category.parent_id === null ||
          category.parent_id === undefined,
      ) as MainCategory[];

      setCategories(mainCategories);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to load Products by Category.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const getSubcategories = (
    category: MainCategory,
  ): Subcategory[] => {
    if (Array.isArray(category.subcategories)) {
      return category.subcategories;
    }

    return [];
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
    });

    setEditingCategory(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setError("");
    setSuccess("");

    setEditingCategory(null);

    setForm({
      name: "",
      slug: "",
    });

    setShowForm(true);
  };

  const openEditForm = (
    category: MainCategory,
  ) => {
    setError("");
    setSuccess("");

    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug ?? "",
    });

    setShowForm(true);
  };

  const handleNameChange = (
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      name: value,

      slug:
        editingCategory === null
          ? value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
          : current.slug,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Main category name is required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /**
       * Main categories must NOT have:
       *
       * - parent_id
       * - image
       *
       * We intentionally send only name and slug.
       */
      const data = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
      };

      if (editingCategory) {
        await adminApi.categories.update(
          editingCategory.id,
          data,
        );

        setSuccess(
          "Main category updated successfully.",
        );
      } else {
        await adminApi.categories.create(data);

        setSuccess(
          "Main category created successfully.",
        );
      }

      resetForm();

      await loadCategories();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while saving the main category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    category: MainCategory,
  ) => {
    const subcategories =
      getSubcategories(category);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?\n\n` +
        `This will delete the main category and its ${subcategories.length} Shop by Category ${
          subcategories.length === 1
            ? "subcategory"
            : "subcategories"
        }.\n\n` +
        `Products will NOT be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setError("");
      setSuccess("");

      await adminApi.categories.delete(
        category.id,
      );

      setSuccess(
        "Main category deleted successfully. Its Shop by Category subcategories were also deleted, but products were kept.",
      );

      await loadCategories();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to delete the main category.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalSubcategories = useMemo(() => {
    return categories.reduce(
      (total, category) =>
        total +
        getSubcategories(category).length,
      0,
    );
  }, [categories]);

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#F59E0B]">
            Category Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#121358] sm:text-3xl">
            Products by Category
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Manage your main product categories.
            Shop by Category subcategories are
            assigned to these main categories separately.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/categories"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Shop by Category
          </Link>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#121358] px-5 text-sm font-semibold text-white transition hover:bg-[#0e1048]"
          >
            + Add Main Category
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#121358]">
                {editingCategory
                  ? "Edit Products by Category"
                  : "Add Products by Category"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingCategory
                  ? "Update the main category information."
                  : "Create a new main category."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Main Category Name */}
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Products by Category *
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Computers"
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/10"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="category-slug"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Slug
                </label>

                <input
                  id="category-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="computers"
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/10"
                />
              </div>
            </div>

            {/* Main Category Information */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-blue-900">
                Main Category
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                This is a main category. It does not
                have a parent category or an image.
                Shop by Category subcategories will
                be assigned to this category separately.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="min-h-11 rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-xl bg-[#121358] px-6 text-sm font-semibold text-white transition hover:bg-[#0e1048] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Products by Category
          </p>

          <p className="mt-2 text-3xl font-bold text-[#121358]">
            {categories.length}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Main categories
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Shop by Category
          </p>

          <p className="mt-2 text-3xl font-bold text-[#121358]">
            {totalSubcategories}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Assigned subcategories
          </p>
        </div>
      </section>

      {/* Main Categories Table */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-[#121358]">
            Products by Category
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Main categories and the Shop by Category
            subcategories assigned to them.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#121358]" />
              Loading categories...
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 9h16"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 13h.01M11 13h.01M14 13h.01"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#121358]">
              No Products by Category yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first main category.
              You can then assign Shop by Category
              subcategories to it.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 min-h-11 rounded-xl bg-[#121358] px-5 text-sm font-semibold text-white hover:bg-[#0e1048]"
            >
              + Add Main Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Products by Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Shop by Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => {
                  const subcategories =
                    getSubcategories(category);

                  return (
                    <tr
                      key={category.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      {/* Main Category */}
                      <td className="px-5 py-4 align-top">
                        <div>
                          <p className="font-semibold text-[#121358]">
                            {category.name}
                          </p>

                          {category.slug && (
                            <p className="mt-1 text-xs text-gray-400">
                              /{category.slug}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Subcategories */}
                      <td className="px-5 py-4 align-top">
                        {subcategories.length ===
                        0 ? (
                          <span className="text-sm text-gray-400">
                            No subcategories
                          </span>
                        ) : (
                          <div className="flex max-w-md flex-wrap gap-2">
                            {subcategories.map(
                              (subcategory) => (
                                <span
                                  key={
                                    subcategory.id
                                  }
                                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
                                >
                                  {
                                    subcategory.name
                                  }
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex rounded-full bg-[#121358]/10 px-3 py-1.5 text-xs font-semibold text-[#121358]">
                          Main Category
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right align-top">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                category,
                              )
                            }
                            title="Edit"
                            aria-label={`Edit ${category.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-[#121358]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L8.25 18.463 4 19.5l1.037-4.25L16.862 3.487Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.5 5.5 18.5 9.5"
                              />
                            </svg>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                category,
                              )
                            }
                            disabled={
                              deletingId ===
                              category.id
                            }
                            title="Delete"
                            aria-label={`Delete ${category.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            category.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 7h12"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10 11v6M14 11v6"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 7V4h6v3"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 7l1 13h6l1-13"
                                />
                              </svg>
                            )}
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
      </section>
    </main>
  );
}