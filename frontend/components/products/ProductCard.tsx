"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

import { cartApi, formatPrice, STORAGE_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import type { Product } from "@/types";

/*
|--------------------------------------------------------------------------
| Product image URL
|--------------------------------------------------------------------------
*/

function normalizeImageUrl(url: string): string {
  return encodeURI(url.replace("http://", "https://"))
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function getProductImageUrl(product: Product): string {
  const image =
    product.images?.find((item) => item.is_primary) ??
    product.images?.[0];

  if (!image) {
    return "/placeholder-product.svg";
  }

  if (image.image_path) {
    const cleanPath = image.image_path.trim();

    if (/^https?:\/\//i.test(cleanPath)) {
      return normalizeImageUrl(cleanPath);
    }

    return normalizeImageUrl(
      `${STORAGE_BASE}/${cleanPath.replace(/^\/+/, "")}`,
    );
  }

  if (image.url) {
    return normalizeImageUrl(image.url);
  }

  return "/placeholder-product.svg";
}

/*
|--------------------------------------------------------------------------
| Calculate discount percentage
|--------------------------------------------------------------------------
*/

function getDiscountPercentage(product: Product): number | null {
  const regularPrice = Number(product.price);
  const discountPrice = Number(product.discount_price);

  if (
    !product.discount_price ||
    regularPrice <= 0 ||
    discountPrice >= regularPrice
  ) {
    return null;
  }

  return Math.round(
    ((regularPrice - discountPrice) / regularPrice) * 100,
  );
}

/*
|--------------------------------------------------------------------------
| Rating stars
|--------------------------------------------------------------------------
*/

function RatingStars({ rating }: { rating: number }) {
  const initialRating = Math.round(Number(rating || 0));
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  const activeRating = hoveredRating || selectedRating;

  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`${activeRating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= activeRating;

        return (
          <button
            key={starValue}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSelectedRating(starValue);
            }}
            onMouseEnter={() => setHoveredRating(starValue)}
            onMouseLeave={() => setHoveredRating(0)}
            className={`text-lg leading-none transition ${
              isActive ? "text-amber-400" : "text-gray-300"
            } hover:text-amber-400`}
            aria-label={`Select ${starValue} star`}
          >
            &#9733;
          </button>
        );
      })}
    </span>
  );
}
export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const regularPrice = Number(product.price);

  const currentPrice = Number(
    product.discount_price ??
      product.effective_price ??
      product.price,
  );

  const discountPercentage = getDiscountPercentage(product);

  const rating = Number(product.average_rating ?? 0);
  const reviewCount = Number(product.review_count ?? 0);

  const productImageUrl = imageFailed
    ? "/placeholder-product.svg"
    : getProductImageUrl(product);

  const selectedVariant =
    product.variants?.find(
      (variant) => Number(variant.stock_qty) > 0,
    ) ?? product.variants?.[0];

  const availableStock = selectedVariant
    ? Number(selectedVariant.stock_qty)
    : Number(product.stock_qty ?? 0);

  const outOfStock = availableStock <= 0;

  async function handleAddToCart(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      const redirect =
        typeof window !== "undefined"
          ? window.location.pathname
          : "/";

      router.push(
        `/login?redirect=${encodeURIComponent(redirect)}`,
      );

      return;
    }

    try {
      setAdding(true);
      setAdded(false);

      await cartApi.addItem({
        product_id: product.id,
        product_variant_id:
          selectedVariant?.id ?? null,
        quantity: 1,
      });

      await refreshCart();

      setAdded(true);

      window.setTimeout(() => {
        setAdded(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Unable to add product to cart:",
        error,
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <Link
        href={`/products/${product.id}`}
        className="block"
      >
        <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-56 lg:h-60">
          {discountPercentage !== null && (
            <span className="absolute left-0 top-0 z-10 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
              -{discountPercentage}%
            </span>
          )}

          <img
            src={productImageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <p className="text-sm text-gray-400">
          {product.brand ||
            product.category?.name ||
            "ShopSphere"}
        </p>

        <Link
          href={`/products/${product.id}`}
          className="mt-1 block"
        >
          <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 transition group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <RatingStars rating={rating} />
        </div>

        <div className="mt-4 flex min-h-8 items-center gap-2">
          {discountPercentage !== null && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(regularPrice)}
            </span>
          )}

          <span className="text-xl font-extrabold text-primary">
            {formatPrice(currentPrice)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || outOfStock}
          className="mt-6 w-full rounded-full bg-gray-100 px-4 py-3 text-sm font-extrabold tracking-wide text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {outOfStock
            ? "OUT OF STOCK"
            : adding
              ? "ADDING..."
              : added
                ? "ADDED TO CART"
                : "ADD TO CART"}
        </button>
      </div>
    </article>
  );
}

