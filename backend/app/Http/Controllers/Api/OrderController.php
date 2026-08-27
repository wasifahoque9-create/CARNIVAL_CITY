<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Order\StoreOrderRequest;
use App\Http\Requests\Api\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CartResolver;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private CartResolver $cartResolver,
    ) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        /*
         * Authentication is optional on this endpoint.
         *
         * Registered customer:
         *   use existing saved shipping address.
         *
         * Guest customer:
         *   use guest cart + checkout information.
         */
        $user = Auth::guard('sanctum')->user();

        $paymentMethod = PaymentMethod::from(
            $request->validated('payment_method')
        );

        if ($user) {
            /*
             * Existing registered-user checkout.
             */
            $order = $this->orderService->placeOrder(
                $user,
                $request->integer('shipping_address_id'),
                $paymentMethod,
                $request->input('gateway_payload', []),
            );
        } else {
            /*
             * Guest checkout.
             *
             * CartResolver reads X-Guest-Token
             * from the request.
             */
            $cart = $this->cartResolver->resolve($request);

            $order = $this->orderService->placeGuestOrder(
                $cart,
                $request->validated(),
                $paymentMethod,
                $request->input('gateway_payload', []),
            );
        }

        /*
         * Load complete order information before
         * sending the newly created order response.
         *
         * Product images are loaded here so the
         * frontend can show ordered product pictures.
         */
        $order->load([
            'user',
            'items.product.images',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' => 'Order placed successfully.',
            'data' => new OrderResource($order),
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with([
                'user',
                'items.product.images',
                'items.variant',
                'shippingAddress',
                'payment',
            ])
            ->latest();

        /*
         * Admin can see every order.
         *
         * Regular authenticated customers can
         * only see their own orders.
         */
        if (! $request->user()->isAdmin()) {
            $query->where(
                'user_id',
                $request->user()->id
            );
        }

        $orders = $query->paginate(
            $request->integer('per_page', 15)
        );

        return response()->json([
            'data' => OrderResource::collection($orders),

            'meta' => [
                'current_page' =>
                    $orders->currentPage(),

                'last_page' =>
                    $orders->lastPage(),

                'per_page' =>
                    $orders->perPage(),

                'total' =>
                    $orders->total(),
            ],
        ]);
    }

    public function show(
        Request $request,
        Order $order
    ): JsonResponse {
        /*
         * Admin can view any order.
         *
         * Registered customers can only view
         * orders belonging to their account.
         */
        if (
            ! $request->user()->isAdmin()
            && $order->user_id !== $request->user()->id
        ) {
            abort(
                403,
                'You are not authorized to view this order.'
            );
        }

        $order->load([
            'user',
            'items.product.images',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'data' =>
                new OrderResource($order),
        ]);
    }

    public function cancel(
        Request $request,
        Order $order
    ): JsonResponse {
        $order =
            $this->orderService->cancelOrder(
                $request->user(),
                $order
            );

        $order->load([
            'user',
            'items.product.images',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' =>
                'Order cancelled successfully.',

            'data' =>
                new OrderResource($order),
        ]);
    }

    public function updateStatus(
        UpdateOrderStatusRequest $request,
        Order $order
    ): JsonResponse {
        $order =
            $this->orderService->updateStatus(
                $order,
                \App\Enums\OrderStatus::from(
                    $request->validated('status')
                ),
            );

        $order->load([
            'user',
            'items.product.images',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' =>
                'Order status updated successfully.',

            'data' =>
                new OrderResource($order),
        ]);
    }
}