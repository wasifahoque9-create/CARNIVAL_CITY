<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function getOrCreateCart(User $user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }

    public function getCartSummary(User $user): array
    {
        $cart = $this->getOrCreateCart($user);
        $cart->load(['items.product', 'items.variant']);

        $subtotal = 0.0;
        $discountTotal = 0.0;

        foreach ($cart->items as $item) {
            $lineTotal = $item->lineTotal();
            $subtotal += $lineTotal;

            if ($item->product->discount_price) {
                $regular = (float) $item->product->price * $item->quantity;
                if ($item->variant) {
                    $regular += (float) $item->variant->price_adjustment * $item->quantity;
                }
                $discountTotal += max(0, $regular - $lineTotal);
            }
        }

        return [
            'cart' => $cart,
            'subtotal' => round($subtotal, 2),
            'discount_total' => round($discountTotal, 2),
            'total' => round($subtotal, 2),
            'item_count' => $cart->items->sum('quantity'),
        ];
    }

    public function addItem(User $user, int $productId, ?int $variantId, int $quantity): Cart
    {
        $product = Product::query()->where('status', 'active')->findOrFail($productId);
        $variant = null;

        if ($variantId) {
            $variant = ProductVariant::query()
                ->where('product_id', $product->id)
                ->findOrFail($variantId);
            $this->assertStock($variant->stock_qty, $quantity, 'Selected variant is out of stock.');
        } else {
            $this->assertStock($product->stock_qty, $quantity, 'Product is out of stock.');
        }

        $cart = $this->getOrCreateCart($user);

        return DB::transaction(function () use ($cart, $product, $variant, $quantity) {
            $item = CartItem::query()->where([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
            ])->first();

            if ($item) {
                $newQty = $item->quantity + $quantity;
                $available = $variant ? $variant->stock_qty : $product->stock_qty;
                $this->assertStock($available, $newQty, 'Insufficient stock for requested quantity.');
                $item->update(['quantity' => $newQty]);
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'quantity' => $quantity,
                ]);
            }

            return $cart->fresh(['items.product', 'items.variant']);
        });
    }

    public function updateItem(User $user, int $cartItemId, int $quantity): Cart
    {
        $cart = $this->getOrCreateCart($user);
        $item = CartItem::query()
            ->where('cart_id', $cart->id)
            ->with(['product', 'variant'])
            ->findOrFail($cartItemId);

        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => ['Quantity must be at least 1.'],
            ]);
        }

        $available = $item->variant ? $item->variant->stock_qty : $item->product->stock_qty;
        $this->assertStock($available, $quantity, 'Insufficient stock for requested quantity.');

        $item->update(['quantity' => $quantity]);

        return $cart->fresh(['items.product', 'items.variant']);
    }

    public function removeItem(User $user, int $cartItemId): Cart
    {
        $cart = $this->getOrCreateCart($user);

        CartItem::query()
            ->where('cart_id', $cart->id)
            ->where('id', $cartItemId)
            ->delete();

        return $cart->fresh(['items.product', 'items.variant']);
    }

    public function clearCart(User $user): void
    {
        $cart = $this->getOrCreateCart($user);
        $cart->items()->delete();
    }

    private function assertStock(int $available, int $requested, string $message): void
    {
        if ($requested > $available) {
            throw ValidationException::withMessages(['quantity' => [$message]]);
        }
    }
}
