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
     * Get guest cart token.
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
     * Detect authenticated Sanctum user.
     *
     * Cart routes are public because guest cart
     * must also work. Therefore we explicitly
     * check the Sanctum guard.
     */
    private function getUser(
        Request $request
    ) {
        return $request->user(
            'sanctum'
        );
    }

    /**
     * Get cart.
     */
    public function index(
        Request $request
    ): JsonResponse {
        $user = $this->getUser(
            $request
        );

        $guestToken =
            $this->getGuestToken(
                $request
            );

        $summary =
            $this->cartService
                ->getCartSummary(
                    $user,
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
     * Add item.
     */
    public function add(
        AddToCartRequest $request
    ): JsonResponse {
        $user = $this->getUser(
            $request
        );

        $guestToken =
            $this->getGuestToken(
                $request
            );

        $cart =
            $this->cartService
                ->addItem(
                    $user,
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
                    $user,
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
     * Update quantity.
     */
    public function update(
        UpdateCartRequest $request
    ): JsonResponse {
        $user = $this->getUser(
            $request
        );

        $guestToken =
            $this->getGuestToken(
                $request
            );

        $cart =
            $this->cartService
                ->updateItem(
                    $user,
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
                    $user,
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
     * Remove one item.
     */
    public function remove(
        RemoveFromCartRequest $request
    ): JsonResponse {
        $user = $this->getUser(
            $request
        );

        $guestToken =
            $this->getGuestToken(
                $request
            );

        $cart =
            $this->cartService
                ->removeItem(
                    $user,
                    $guestToken,

                    $request->integer(
                        'cart_item_id'
                    )
                );

        $summary =
            $this->cartService
                ->getCartSummary(
                    $user,
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
     * Clear cart.
     */
    public function clear(
        Request $request
    ): JsonResponse {
        $user = $this->getUser(
            $request
        );

        $guestToken =
            $this->getGuestToken(
                $request
            );

        $this->cartService
            ->clearCart(
                $user,
                $guestToken
            );

        $summary =
            $this->cartService
                ->getCartSummary(
                    $user,
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