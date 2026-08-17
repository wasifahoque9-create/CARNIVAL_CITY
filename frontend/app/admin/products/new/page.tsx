import Link from "next/link";
import ProductForm from "../Components/ProductForm";

export default function NewProductPage() {
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#F59E0B]">
            Product Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#121358] sm:text-3xl">
            Add New Product
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter the product information and assign it to a category.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Back to Products
        </Link>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <ProductForm />
      </section>
    </main>
  );
}