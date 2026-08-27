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
    /**
     * Get or create cart for either:
     * - Logged-in user
     * - Guest customer using guest token
     */
    public function getOrCreateCart(
        ?User $user,
        ?string $guestToken = null
    ): Cart {
        if ($user) {
            return Cart::firstOrCreate([
                'user_id' => $user->id,
            ]);
        }

        if (!$guestToken) {
            throw ValidationException::withMessages([
                'guest_token' => [
                    'Guest cart token is required.',
                ],
            ]);
        }

        return Cart::firstOrCreate([
            'guest_token' => $guestToken,
        ]);
    }

    /**
     * Get cart summary.
     */
    public function getCartSummary(
        ?User $user,
        ?string $guestToken = null
    ): array {
        $cart = $this->getOrCreateCart(
            $user,
            $guestToken
        );

        $cart->load([
            'items.product',
            'items.variant',
        ]);

        $subtotal = 0.0;
        $discountTotal = 0.0;

        foreach ($cart->items as $item) {
            $lineTotal = $item->lineTotal();

            $subtotal += $lineTotal;

            if (
                $item->product &&
                $item->product->discount_price
            ) {
                $regular =
                    (float) $item->product->price *
                    $item->quantity;

                if ($item->variant) {
                    $regular +=
                        (float) $item->variant->price_adjustment *
                        $item->quantity;
                }

                $discountTotal += max(
                    0,
                    $regular - $lineTotal
                );
            }
        }

        return [
            'cart' => $cart,
            'subtotal' => round($subtotal, 2),
            'discount_total' => round(
                $discountTotal,
                2
            ),
            'total' => round($subtotal, 2),
            'item_count' => $cart->items->sum(
                'quantity'
            ),
        ];
    }

    /**
     * Add product to cart.
     */
    public function addItem(
        ?User $user,
        ?string $guestToken,
        int $productId,
        ?int $variantId,
        int $quantity
    ): Cart {
        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => [
                    'Quantity must be at least 1.',
                ],
            ]);
        }

        $product = Product::query()
            ->where('status', 'active')
            ->findOrFail($productId);

        $variant = null;

        if ($variantId) {
            $variant = ProductVariant::query()
                ->where(
                    'product_id',
                    $product->id
                )
                ->findOrFail($variantId);

            $this->assertStock(
                (int) $variant->stock_qty,
                $quantity,
                'Selected variant is out of stock.'
            );
        } else {
            $this->assertStock(
                (int) $product->stock_qty,
                $quantity,
                'Product is out of stock.'
            );
        }

        $cart = $this->getOrCreateCart(
            $user,
            $guestToken
        );

        return DB::transaction(
            function () use (
                $cart,
                $product,
                $variant,
                $quantity
            ) {
                $item = CartItem::query()
                    ->where(
                        'cart_id',
                        $cart->id
                    )
                    ->where(
                        'product_id',
                        $product->id
                    )
                    ->where(
                        'product_variant_id',
                        $variant?->id
                    )
                    ->first();

                if ($item) {
                    $newQty =
                        (int) $item->quantity +
                        $quantity;

                    $available = $variant
                        ? (int) $variant->stock_qty
                        : (int) $product->stock_qty;

                    $this->assertStock(
                        $available,
                        $newQty,
                        'Insufficient stock for requested quantity.'
                    );

                    $item->update([
                        'quantity' => $newQty,
                    ]);
                } else {
                    CartItem::create([
                        'cart_id' => $cart->id,
                        'product_id' => $product->id,
                        'product_variant_id' =>
                            $variant?->id,
                        'quantity' => $quantity,
                    ]);
                }

                return $cart->fresh([
                    'items.product',
                    'items.variant',
                ]);
            }
        );
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(
        ?User $user,
        ?string $guestToken,
        int $cartItemId,
        int $quantity
    ): Cart {
        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => [
                    'Quantity must be at least 1.',
                ],
            ]);
        }

        $cart = $this->getOrCreateCart(
            $user,
            $guestToken
        );

        $item = CartItem::query()
            ->where(
                'cart_id',
                $cart->id
            )
            ->with([
                'product',
                'variant',
            ])
            ->findOrFail($cartItemId);

        $available = $item->variant
            ? (int) $item->variant->stock_qty
            : (int) $item->product->stock_qty;

        $this->assertStock(
            $available,
            $quantity,
            'Insufficient stock for requested quantity.'
        );

        $item->update([
            'quantity' => $quantity,
        ]);

        return $cart->fresh([
            'items.product',
            'items.variant',
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(
        ?User $user,
        ?string $guestToken,
        int $cartItemId
    ): Cart {
        $cart = $this->getOrCreateCart(
            $user,
            $guestToken
        );

        CartItem::query()
            ->where(
                'cart_id',
                $cart->id
            )
            ->where(
                'id',
                $cartItemId
            )
            ->delete();

        return $cart->fresh([
            'items.product',
            'items.variant',
        ]);
    }

    /**
     * Clear all cart items.
     */
    public function clearCart(
        ?User $user,
        ?string $guestToken = null
    ): void {
        $cart = $this->getOrCreateCart(
            $user,
            $guestToken
        );

        $cart->items()->delete();
    }

    /**
     * Check available stock.
     */
    private function assertStock(
        int $available,
        int $requested,
        string $message
    ): void {
        if ($requested > $available) {
            throw ValidationException::withMessages([
                'quantity' => [
                    $message,
                ],
            ]);
        }
    }
}