<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Cart\AddToCartRequest;
use App\Http\Requests\Api\Cart\RemoveFromCartRequest;
use App\Http\Requests\Api\Cart\UpdateCartRequest;
use App\Http\Resources\CartResource;
use App\Services\CartResolver;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private CartResolver $cartResolver,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartResolver->resolve($request);

        $summary = $this->cartService->getCartSummary($cart);

        return response()->json([
            'cart' => new CartResource($summary['cart']),
            'subtotal' => $summary['subtotal'],
            'discount_total' => $summary['discount_total'],
            'total' => $summary['total'],
            'item_count' => $summary['item_count'],
        ]);
    }

    public function add(AddToCartRequest $request): JsonResponse
    {
        $resolvedCart = $this->cartResolver->resolve($request);

        $cart = $this->cartService->addItem(
            $resolvedCart,
            $request->integer('product_id'),
            $request->input('product_variant_id'),
            $request->integer('quantity'),
        );

        $summary = $this->cartService->getCartSummary($cart);

        return response()->json([
            'message' => 'Item added to cart.',
            'cart' => new CartResource($cart),
            'subtotal' => $summary['subtotal'],
            'discount_total' => $summary['discount_total'],
            'total' => $summary['total'],
            'item_count' => $summary['item_count'],
        ]);
    }

    public function update(UpdateCartRequest $request): JsonResponse
    {
        $resolvedCart = $this->cartResolver->resolve($request);

        $cart = $this->cartService->updateItem(
            $resolvedCart,
            $request->integer('cart_item_id'),
            $request->integer('quantity'),
        );

        $summary = $this->cartService->getCartSummary($cart);

        return response()->json([
            'message' => 'Cart updated.',
            'cart' => new CartResource($cart),
            'subtotal' => $summary['subtotal'],
            'discount_total' => $summary['discount_total'],
            'total' => $summary['total'],
            'item_count' => $summary['item_count'],
        ]);
    }

    public function remove(RemoveFromCartRequest $request): JsonResponse
    {
        $resolvedCart = $this->cartResolver->resolve($request);

        $cart = $this->cartService->removeItem(
            $resolvedCart,
            $request->integer('cart_item_id'),
        );

        $summary = $this->cartService->getCartSummary($cart);

        return response()->json([
            'message' => 'Item removed from cart.',
            'cart' => new CartResource($cart),
            'subtotal' => $summary['subtotal'],
            'discount_total' => $summary['discount_total'],
            'total' => $summary['total'],
            'item_count' => $summary['item_count'],
        ]);
    }
}