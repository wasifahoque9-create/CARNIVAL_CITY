<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Payment\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $order = $this->orderService->placeOrder(
            $request->user(),
            $request->integer('shipping_address_id'),
            PaymentMethod::from($request->string('payment_method')),
            $request->input('gateway_payload', []),
        );

        return response()->json([
            'message' => 'Checkout completed successfully.',
            'order' => new OrderResource($order),
            'payment' => new PaymentResource($order->payment),
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $query = Payment::query()
            ->with(['order'])
            ->latest();

        if (! $request->user()->isAdmin()) {
            $query->whereHas('order', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        $payments = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => PaymentResource::collection($payments),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        $payment->load('order');

        if (! $request->user()->isAdmin() && $payment->order->user_id !== $request->user()->id) {
            abort(403, 'You are not authorized to view this payment.');
        }

        return response()->json([
            'data' => new PaymentResource($payment),
            'order' => new OrderResource($payment->order),
        ]);
    }
}
