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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ name: string; slug: string; type: CategoryType }>({
    name: "",
    slug: "",
    type: "accessory",
  });
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    const data = await adminApi.categories.list();
    setCategories(data);
  }

  useEffect(() => {
    loadCategories().finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ name: "", slug: "", type: "accessory" });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
    });
    setEditingId(cat.id);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.categories.update(editingId, form);
      } else {
        await adminApi.categories.create(form);
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

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Categories</h1>
          <p className="text-muted">Manage product categories</p>
        </div>
        <Button variant="secondary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Category
        </Button>
      </div>

      {showForm && (
        <Card className="mt-8 max-w-lg" padding="md">
          <CardHeader title={editingId ? "Edit Category" : "New Category"} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} />
            <Input label="Slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
              options={categoryTypes}
            />
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>{editingId ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-8 overflow-hidden" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-muted">{cat.slug}</td>
                  <td className="px-4 py-3 capitalize">{cat.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(cat)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(cat.id)}>Delete</Button>
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
