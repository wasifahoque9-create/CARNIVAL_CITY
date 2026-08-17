<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Order\StoreOrderRequest;
use App\Http\Requests\Api\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->placeOrder(
            $request->user(),
            $request->integer('shipping_address_id'),
            PaymentMethod::from($request->string('payment_method')),
            $request->input('gateway_payload', []),
        );

        return response()->json([
            'message' => 'Order placed successfully.',
            'data' => new OrderResource($order),
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with(['items.product', 'items.variant', 'shippingAddress', 'payment'])
            ->latest();

        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $orders = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if (! $request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            abort(403, 'You are not authorized to view this order.');
        }

        $order->load(['items.product', 'items.variant', 'shippingAddress', 'payment']);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        $order = $this->orderService->cancelOrder($request->user(), $order);

        return response()->json([
            'message' => 'Order cancelled successfully.',
            'data' => new OrderResource($order),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $order = $this->orderService->updateStatus(
            $order,
            \App\Enums\OrderStatus::from($request->validated('status')),
        );

        return response()->json([
            'message' => 'Order status updated successfully.',
            'data' => new OrderResource($order),
        ]);
    }
}
