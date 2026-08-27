<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Cart\AddToCartRequest;
use App\Http\Requests\Api\Cart\RemoveFromCartRequest;
use App\Http\Requests\Api\Cart\UpdateCartRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService
    ) {}

    /**
     * Get guest token from request header.
     */
    private function getGuestToken(
        Request $request
    ): ?string {
        $token = $request->header(
            'X-Guest-Cart-Token'
        );

        return $token
            ? trim((string) $token)
            : null;
    }

    /**
     * Get cart summary.
     */
    public function index(
        Request $request
    ): JsonResponse {
        $guestToken =
            $this->getGuestToken($request);

        $summary =
            $this->cartService
                ->getCartSummary(
                    $request->user(),
                    $guestToken
                );

        return response()->json([
            'cart' =>
                new CartResource(
                    $summary['cart']
                ),

            'subtotal' =>
                $summary['subtotal'],

            'discount_total' =>
                $summary['discount_total'],

            'total' =>
                $summary['total'],

            'item_count' =>
                $summary['item_count'],
        ]);
    }

    /**
     * Add item to cart.
     */
    public function add(
        AddToCartRequest $request
    ): JsonResponse {
        $guestToken =
            $this->getGuestToken($request);

        $cart =
            $this->cartService->addItem(
                $request->user(),
                $guestToken,
                $request->integer(
                    'product_id'
                ),

                $request->filled(
                    'product_variant_id'
                )
                    ? $request->integer(
                        'product_variant_id'
                    )
                    : null,

                $request->integer(
                    'quantity'
                )
            );

        $summary =
            $this->cartService
                ->getCartSummary(
                    $request->user(),
                    $guestToken
                );

        return response()->json([
            'message' =>
                'Item added to cart.',

            'cart' =>
                new CartResource($cart),

            'subtotal' =>
                $summary['subtotal'],

            'discount_total' =>
                $summary['discount_total'],

            'total' =>
                $summary['total'],

            'item_count' =>
                $summary['item_count'],
        ]);
    }

    /**
     * Update cart item quantity.
     */
    public function update(
        UpdateCartRequest $request
    ): JsonResponse {
        $guestToken =
            $this->getGuestToken($request);

        $cart =
            $this->cartService
                ->updateItem(
                    $request->user(),
                    $guestToken,
                    $request->integer(
                        'cart_item_id'
                    ),
                    $request->integer(
                        'quantity'
                    )
                );

        $summary =
            $this->cartService
                ->getCartSummary(
                    $request->user(),
                    $guestToken
                );

        return response()->json([
            'message' =>
                'Cart updated.',

            'cart' =>
                new CartResource($cart),

            'subtotal' =>
                $summary['subtotal'],

            'discount_total' =>
                $summary['discount_total'],

            'total' =>
                $summary['total'],

            'item_count' =>
                $summary['item_count'],
        ]);
    }

    /**
     * Remove one item from cart.
     */
    public function remove(
        RemoveFromCartRequest $request
    ): JsonResponse {
        $guestToken =
            $this->getGuestToken($request);

        $cart =
            $this->cartService
                ->removeItem(
                    $request->user(),
                    $guestToken,
                    $request->integer(
                        'cart_item_id'
                    )
                );

        $summary =
            $this->cartService
                ->getCartSummary(
                    $request->user(),
                    $guestToken
                );

        return response()->json([
            'message' =>
                'Item removed from cart.',

            'cart' =>
                new CartResource($cart),

            'subtotal' =>
                $summary['subtotal'],

            'discount_total' =>
                $summary['discount_total'],

            'total' =>
                $summary['total'],

            'item_count' =>
                $summary['item_count'],
        ]);
    }

    /**
     * Clear all items from cart.
     */
    public function clear(
        Request $request
    ): JsonResponse {
        $guestToken =
            $this->getGuestToken($request);

        $this->cartService->clearCart(
            $request->user(),
            $guestToken
        );

        $summary =
            $this->cartService
                ->getCartSummary(
                    $request->user(),
                    $guestToken
                );

        return response()->json([
            'message' =>
                'Cart cleared successfully.',

            'cart' =>
                new CartResource(
                    $summary['cart']
                ),

            'subtotal' =>
                $summary['subtotal'],

            'discount_total' =>
                $summary['discount_total'],

            'total' =>
                $summary['total'],

            'item_count' =>
                $summary['item_count'],
        ]);
    }
}