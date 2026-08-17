import type { Product } from "@/types";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({
  products,
}: ProductGridProps) {
  /*
  |--------------------------------------------------------------------------
  | Empty product result
  |--------------------------------------------------------------------------
  */

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center">
        <div>
          <p className="text-lg font-bold text-slate-800">
            No products found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Products will appear here when they are available.
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Responsive product grid
  |--------------------------------------------------------------------------
  |
  | Mobile:        1 product per row
  | Small tablet:  2 products per row
  | Desktop:       3 products per row
  |
  */

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}