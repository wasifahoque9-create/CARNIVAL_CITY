"use client";

import Link from "next/link";

import { formatPrice, getProductImage } from "@/lib/api";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void | Promise<void>;
  onRemove: (id: number) => void | Promise<void>;
  updating?: boolean;
}

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  updating = false,
}: CartItemRowProps) {
  const itemData = item as any;
  const product = itemData.product;
  const variant = itemData.variant;

  const itemId = Number(itemData.id);
  const quantity = Number(itemData.quantity ?? 1);

  const productHref = product?.id
    ? `/products/${product.id}`
    : product?.slug
      ? `/products/${product.slug}`
      : "#";

  const image = product ? getProductImage(product) : "/placeholder-product.svg";

  const unitPrice = Number(
    itemData.unit_price ??
      product?.effective_price ??
      product?.price ??
      0,
  );

  const lineTotal = Number(itemData.line_total ?? unitPrice * quantity);

  function decreaseQuantity() {
    if (quantity <= 1 || updating) return;
    void onUpdateQuantity(itemId, quantity - 1);
  }

  function increaseQuantity() {
    if (updating) return;
    void onUpdateQuantity(itemId, quantity + 1);
  }

  function removeItem() {
    if (updating) return;
    void onRemove(itemId);
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={productHref}
          className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 sm:mx-0 sm:h-24 sm:w-24"
        >
          <img
            src={image}
            alt={product?.name || "Product"}
            className="h-full w-full object-contain p-3"
            onError={(event) => {
              event.currentTarget.src = "/placeholder-product.svg";
            }}
          />
        </Link>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <Link href={productHref}>
            <h3 className="line-clamp-2 break-words text-lg font-black text-[#121358] hover:text-[#F59E0B] sm:text-base">
              {product?.name || "Product"}
            </h3>
          </Link>

          {variant && (
            <p className="mt-1 text-sm text-slate-500">
              {variant.variant_name}: {variant.variant_value}
            </p>
          )}

          <p className="mt-2 text-lg font-black text-slate-900 sm:text-base">
            {formatPrice(unitPrice)}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:items-end">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={updating || quantity <= 1}
              className="h-12 w-14 rounded-l-2xl text-2xl font-black text-[#121358] disabled:opacity-40"
            >
              -
            </button>

            <span className="flex h-12 min-w-[4rem] items-center justify-center px-4 text-lg font-black text-[#121358]">
              {quantity}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={updating}
              className="h-12 w-14 rounded-r-2xl text-2xl font-black text-[#121358] disabled:opacity-40"
            >
              +
            </button>
          </div>

          <p className="w-full text-center text-lg font-black text-[#121358] sm:text-right">
            {formatPrice(lineTotal)}
          </p>

          <button
            type="button"
            onClick={removeItem}
            disabled={updating}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
