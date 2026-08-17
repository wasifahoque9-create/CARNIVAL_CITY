"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { PageLoader } from "@/components/ui/Spinner";
import { adminApi } from "@/lib/api";
import type { Category } from "@/types";

type ProductImagePreview = {
  id?: number;
  image_path?: string | null;
  url?: string | null;
  is_primary?: boolean;
};

type EditProductForm = {
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: string;
  discount_price: string;
  stock_qty: string;
  status: string;
  description: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://shopsphere-backend-bsma.onrender.com/api";

const initialForm: EditProductForm = {
  category_id: "",
  name: "",
  slug: "",
  sku: "",
  brand: "",
  price: "",
  discount_price: "",
  stock_qty: "",
  status: "active",
  description: "",
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getToken() {
  if (typeof window === "undefined") return "";

  const direct =
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("shopsphere_token") ||
    "";

  if (direct) return direct.replace(/^Bearer\s+/i, "");

  const keys = ["auth", "user", "admin", "session"];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const token =
        parsed?.token ||
        parsed?.access_token ||
        parsed?.auth_token ||
        parsed?.data?.token ||
        parsed?.data?.access_token ||
        "";

      if (token) return String(token).replace(/^Bearer\s+/i, "");
    } catch {
      //
    }
  }

  return "";
}

function headers(json = true): HeadersInit {
  const token = getToken();

  const value: HeadersInit = {
    Accept: "application/json",
  };

  if (json) {
    value["Content-Type"] = "application/json";
  }

  if (token) {
    value.Authorization = `Bearer ${token}`;
  }

  return value;
}

function unwrap(response: any) {
  return response?.data?.data ?? response?.data ?? response?.product ?? response;
}

function listFrom(response: any): any[] {
  const data = unwrap(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;

  return [];
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    headers: headers(false),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }

  return response.json();
}

async function fetchCategories() {
  const urls = [`${API_BASE}/admin/categories`, `${API_BASE}/categories`];

  for (const url of urls) {
    try {
      const json = await fetchJson(url);
      const list = listFrom(json);

      if (list.length > 0) return list;
    } catch {
      //
    }
  }

  try {
    const response = await adminApi.categories.list();
    return listFrom(response);
  } catch {
    return [];
  }
}

async function findProductInList(id: number, endpoint: string) {
  for (let page = 1; page <= 50; page += 1) {
    try {
      const json = await fetchJson(
        `${API_BASE}/${endpoint}?page=${page}&per_page=100`,
      );

      const products = listFrom(json);
      const found = products.find((item) => Number(item.id) === Number(id));

      if (found) return found;
      if (products.length === 0) break;

      const meta =
        json?.meta ??
        json?.data?.meta ??
        json?.pagination ??
        json?.data?.pagination ??
        null;

      if (
        meta?.current_page &&
        meta?.last_page &&
        Number(meta.current_page) >= Number(meta.last_page)
      ) {
        break;
      }
    } catch {
      break;
    }
  }

  return null;
}

async function loadProduct(id: number) {
  const directUrls = [
    `${API_BASE}/admin/products/${id}`,
    `${API_BASE}/admin/products/${id}/edit`,
    `${API_BASE}/products/${id}`,
  ];

  for (const url of directUrls) {
    try {
      const json = await fetchJson(url);
      const product = unwrap(json);

      if (product?.id) return product;
    } catch {
      //
    }
  }

  try {
    const response = await adminApi.products.get(id);
    const product = unwrap(response);

    if (product?.id) return product;
  } catch {
    //
  }

  const adminListProduct = await findProductInList(id, "admin/products");
  if (adminListProduct) return adminListProduct;

  const publicListProduct = await findProductInList(id, "products");
  if (publicListProduct) return publicListProduct;

  throw new Error("Product not found");
}

function imageUrl(image: ProductImagePreview) {
  const url = image.url || image.image_path || "";

  if (!url) return "/placeholder-product.svg";

  if (/^https?:\/\//i.test(url)) {
    return url.replace("http://", "https://");
  }

  const storageBase =
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    "https://shopsphere-backend-bsma.onrender.com/storage";

  return `${storageBase}/${url.replace(/^\/+/, "").replace(/^storage\//, "")}`;
}

function productImages(product: any): ProductImagePreview[] {
  const images = product?.images ?? product?.product_images ?? [];

  if (Array.isArray(images) && images.length > 0) return images;

  const primary =
    product?.primary_image ??
    product?.primaryImage ??
    product?.image ??
    product?.thumbnail ??
    "";

  if (!primary) return [];

  if (typeof primary === "string") {
    return [
      {
        url: primary,
        image_path: primary,
        is_primary: true,
      },
    ];
  }

  return [primary];
}

async function updateRaw(id: number, body: any, files: File[]) {
  if (files.length > 0) {
    const formData = new FormData();

    formData.append("_method", "PUT");

    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value === null || value === undefined ? "" : String(value));
    });

    files.forEach((file) => {
      formData.append("images[]", file);
    });

    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: "POST",
      credentials: "include",
      headers: headers(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Update failed");
    }

    return response.json();
  }

  const response = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: headers(true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const retry = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: "POST",
      credentials: "include",
      headers: headers(true),
      body: JSON.stringify({
        _method: "PUT",
        ...body,
      }),
    });

    if (!retry.ok) {
      throw new Error("Update failed");
    }

    return retry.json();
  }

  return response.json();
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params.id;
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<EditProductForm>(initialForm);
  const [currentImages, setCurrentImages] = useState<ProductImagePreview[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const product = await loadProduct(id);
        let categoryList = await fetchCategories();

        const categoryId =
          product?.category_id ??
          product?.category?.id ??
          product?.primary_category?.id ??
          product?.categories?.[0]?.id ??
          "";

        if (
          categoryId &&
          categoryList.length === 0 &&
          (product?.category?.name || product?.primary_category?.name)
        ) {
          categoryList = [
            {
              id: Number(categoryId),
              name: product?.category?.name ?? product?.primary_category?.name,
            },
          ];
        }

        if (!mounted) return;

        setCategories(categoryList);

        setForm({
          category_id: categoryId ? String(categoryId) : "",
          name: product?.name ?? "",
          slug: product?.slug ?? "",
          sku: product?.sku ?? "",
          brand: product?.brand ?? "",
          price:
            product?.price !== null && product?.price !== undefined
              ? String(product.price)
              : "",
          discount_price:
            product?.discount_price !== null &&
            product?.discount_price !== undefined
              ? String(product.discount_price)
              : "",
          stock_qty:
            product?.stock_qty !== null && product?.stock_qty !== undefined
              ? String(product.stock_qty)
              : "0",
          status: product?.status ?? "active",
          description: product?.description ?? "",
        });

        setCurrentImages(productImages(product));
      } catch (error) {
        console.error("Unable to load product:", error);
        setError("Product could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  function updateForm(field: keyof EditProductForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));

    setSelectedFiles(files);
    setSelectedPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = {
      category_id: form.category_id ? Number(form.category_id) : null,
      name: form.name,
      slug: form.slug || makeSlug(form.name),
      sku: form.sku,
      brand: form.brand,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock_qty: Number(form.stock_qty),
      status: form.status,
      description: form.description,
    };

    try {
      setSaving(true);
      setError("");

      try {
        if (selectedFiles.length > 0) {
          const data = new FormData();

          Object.entries(body).forEach(([key, value]) => {
            data.append(key, value === null || value === undefined ? "" : String(value));
          });

          selectedFiles.forEach((file) => {
            data.append("images[]", file);
          });

          await adminApi.products.update(id, data as any);
        } else {
          await adminApi.products.update(id, body);
        }
      } catch {
        await updateRaw(id, body, selectedFiles);
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Product update failed:", error);
      setError("Product could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-[#121358] hover:text-orange-500"
        >
          &larr; Back to products
        </Link>

        <h1 className="mt-4 text-3xl font-black text-[#121358]">
          Edit Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Product category
              </label>
              <select
                value={form.category_id}
                onChange={(event) =>
                  updateForm("category_id", event.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Product name
              </label>
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                SKU
              </label>
              <input
                value={form.sku}
                onChange={(event) => updateForm("sku", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(event) => updateForm("brand", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Discount price
              </label>
              <input
                type="number"
                step="0.01"
                value={form.discount_price}
                onChange={(event) =>
                  updateForm("discount_price", event.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Stock quantity
              </label>
              <input
                type="number"
                value={form.stock_qty}
                onChange={(event) =>
                  updateForm("stock_qty", event.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              className="min-h-36 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#121358] focus:ring-2 focus:ring-[#121358]/20"
              required
            />
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-slate-700">
              Current images
            </p>

            {currentImages.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {currentImages.map((image, index) => (
                  <div key={image.id ?? index}>
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src={imageUrl(image)}
                        alt={form.name || "Product"}
                        className="h-full w-full object-contain p-2"
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder-product.svg";
                        }}
                      />
                    </div>

                    {image.is_primary && (
                      <p className="mt-2 text-xs font-bold text-green-600">
                        Primary image
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-slate-200 text-sm font-bold text-slate-500">
                Product
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Replace product images
            </label>

            <label className="flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-slate-300 bg-white p-3 text-sm sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              <span className="inline-flex w-fit items-center justify-center rounded-lg bg-[#121358] px-5 py-3 text-sm font-black text-white transition hover:bg-[#F59E0B] hover:text-[#121358]">
                Choose Files
              </span>

              <span className="text-sm font-semibold text-slate-500">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : "No file chosen"}
              </span>
            </label>

            {selectedPreviews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {selectedPreviews.map((preview, index) => (
                  <div key={preview}>
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src={preview}
                        alt={`Selected image ${index + 1}`}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>

                    {index === 0 && (
                      <p className="mt-2 text-xs font-bold text-green-600">
                        New primary image
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <Link
              href="/admin/products"
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#121358] px-7 py-3 text-sm font-black text-white transition hover:bg-orange-500 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
