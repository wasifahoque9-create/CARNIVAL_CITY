<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Order\StoreOrderRequest;
use App\Http\Requests\Api\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Guest Cart Token
    |--------------------------------------------------------------------------
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

    /*
    |--------------------------------------------------------------------------
    | Place Order
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreOrderRequest $request
    ): JsonResponse {
        $user =
            $request->user('sanctum');

        $guestToken =
            $this->getGuestToken(
                $request
            );

        $deliveryMethod =
            (string) $request->input(
                'delivery_method',
                'home_delivery'
            );

        $shippingAddressId =
            $request->filled(
                'shipping_address_id'
            )
                ? $request->integer(
                    'shipping_address_id'
                )
                : null;

        $paymentMethod =
            PaymentMethod::from(
                (string) $request->input(
                    'payment_method'
                )
            );

        $guestData = [
            'guest_name' =>
                $request->input(
                    'guest_name'
                ),

            'guest_email' =>
                $request->input(
                    'guest_email'
                ),

            'guest_phone' =>
                $request->input(
                    'guest_phone'
                ),

            'guest_address_line1' =>
                $request->input(
                    'guest_address_line1'
                ),

            'guest_address_line2' =>
                $request->input(
                    'guest_address_line2'
                ),

            'guest_city' =>
                $request->input(
                    'guest_city'
                ),

            'guest_postal_code' =>
                $request->input(
                    'guest_postal_code'
                ),

            'guest_country' =>
                $request->input(
                    'guest_country'
                ),
        ];

        $gatewayPayload =
            $request->input(
                'gateway_payload',
                []
            );

        $order =
            $this->orderService
                ->placeOrder(
                    $user,
                    $guestToken,
                    $shippingAddressId,
                    $paymentMethod,
                    $deliveryMethod,
                    $guestData,
                    $gatewayPayload,
                );

        $order->loadMissing([
            'user',
            'items.product',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' =>
                'Order placed successfully.',

            'data' =>
                new OrderResource(
                    $order
                ),
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Order List
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request
    ): JsonResponse {
        $query =
            Order::query()
                ->with([
                    'user',
                    'items.product',
                    'items.variant',
                    'shippingAddress',
                    'payment',
                ])
                ->latest();

        if (
            ! $request->user()->isAdmin()
        ) {
            $query->where(
                'user_id',
                $request->user()->id
            );
        }

        $orders =
            $query->paginate(
                $request->integer(
                    'per_page',
                    15
                )
            );

        return response()->json([
            'data' =>
                OrderResource::collection(
                    $orders
                ),

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

    /*
    |--------------------------------------------------------------------------
    | Single Order
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        Order $order
    ): JsonResponse {
        if (
            ! $request->user()->isAdmin()
            &&
            $order->user_id !==
                $request->user()->id
        ) {
            abort(
                403,
                'You are not authorized to view this order.'
            );
        }

        $order->load([
            'user',
            'items.product',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'data' =>
                new OrderResource(
                    $order
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Guest Order Details / Tracking
    |--------------------------------------------------------------------------
    */

    public function guestShow(
        Request $request,
        Order $order
    ): JsonResponse {
        /*
         * Registered customer orders are not available
         * through the guest tracking endpoint.
         */
        if (! is_null($order->user_id)) {
            return response()->json([
                'message' =>
                    'This order is not a guest order.',
            ], 403);
        }

        $guestToken =
            $this->getGuestToken(
                $request
            );

        /*
         * Guest token is required and must exactly match
         * the token stored with this guest order.
         */
        if (
            empty($guestToken)
            ||
            empty($order->guest_token)
            ||
            ! hash_equals(
                (string) $order->guest_token,
                (string) $guestToken
            )
        ) {
            return response()->json([
                'message' =>
                    'Invalid or missing guest order token.',
            ], 403);
        }

        $order->load([
            'user',
            'items.product',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'data' =>
                new OrderResource(
                    $order
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Customer Cancel Order
    |--------------------------------------------------------------------------
    */

    public function cancel(
        Request $request,
        Order $order
    ): JsonResponse {
        $order =
            $this->orderService
                ->cancelOrder(
                    $request->user(),
                    $order
                );

        $order->loadMissing([
            'user',
            'items.product',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' =>
                'Order cancelled successfully.',

            'data' =>
                new OrderResource(
                    $order
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Update Order Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(
        UpdateOrderStatusRequest $request,
        Order $order
    ): JsonResponse {
        $status =
            OrderStatus::from(
                $request->validated(
                    'status'
                )
            );

        $order =
            $this->orderService
                ->updateStatus(
                    $order,
                    $status
                );

        /*
         * Home Delivery order Shipped হলে
         * delivery tracking শুরু হবে।
         */
        if (
            $order->delivery_method ===
                'home_delivery'
            &&
            $status ===
                OrderStatus::Shipped
            &&
            empty(
                $order->delivery_status
            )
        ) {
            $order->update([
                'delivery_status' =>
                    'shipped',

                'delivery_updated_at' =>
                    now(),
            ]);
        }

        /*
         * Main order Delivered হলে
         * tracking status-ও Delivered।
         */
        if (
            $order->delivery_method ===
                'home_delivery'
            &&
            $status ===
                OrderStatus::Delivered
        ) {
            $order->update([
                'delivery_status' =>
                    'delivered',

                'delivery_updated_at' =>
                    now(),
            ]);
        }

        $order->loadMissing([
            'user',
            'items.product',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' =>
                'Order status updated successfully.',

            'data' =>
                new OrderResource(
                    $order
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Update Delivery Tracking
    |--------------------------------------------------------------------------
    */

    public function updateDeliveryTracking(
        Request $request,
        Order $order
    ): JsonResponse {
        /*
         * Store Pickup order-এ delivery tracking নেই।
         */
        if (
            $order->delivery_method !==
            'home_delivery'
        ) {
            return response()->json([
                'message' =>
                    'Delivery tracking is only available for home delivery orders.',
            ], 422);
        }

        /*
         * Cancelled order update করা যাবে না।
         */
        if (
            $order->status ===
            OrderStatus::Cancelled
        ) {
            return response()->json([
                'message' =>
                    'Cancelled orders cannot be updated for delivery tracking.',
            ], 422);
        }

        /*
         * Tracking শুরু হবে Shipped হওয়ার পর।
         */
        if (
            $order->status !==
                OrderStatus::Shipped
            &&
            $order->status !==
                OrderStatus::Delivered
        ) {
            return response()->json([
                'message' =>
                    'Mark the order as shipped before updating delivery tracking.',
            ], 422);
        }

        $validated =
            $request->validate([
                'delivery_person_name' => [
                    'nullable',
                    'string',
                    'max:150',
                ],

                'delivery_person_phone' => [
                    'nullable',
                    'string',
                    'max:30',
                ],

                'tracking_number' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'delivery_status' => [
                    'required',
                    'string',
                    Rule::in([
                        'shipped',
                        'in_transit',
                        'out_for_delivery',
                        'delivered',
                    ]),
                ],

                'delivery_note' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],
            ]);

        $order->update([
            'delivery_person_name' =>
                $validated[
                    'delivery_person_name'
                ] ?? null,

            'delivery_person_phone' =>
                $validated[
                    'delivery_person_phone'
                ] ?? null,

            'tracking_number' =>
                $validated[
                    'tracking_number'
                ] ?? null,

            'delivery_status' =>
                $validated[
                    'delivery_status'
                ],

            'delivery_note' =>
                $validated[
                    'delivery_note'
                ] ?? null,

            'delivery_updated_at' =>
                now(),
        ]);

        /*
         * Tracking Delivered হলে
         * main order-ও Delivered হবে।
         */
        if (
            $validated[
                'delivery_status'
            ] === 'delivered'
            &&
            $order->status !==
                OrderStatus::Delivered
        ) {
            $order =
                $this->orderService
                    ->updateStatus(
                        $order,
                        OrderStatus::Delivered
                    );

            $order->update([
                'delivery_status' =>
                    'delivered',

                'delivery_updated_at' =>
                    now(),
            ]);
        }

        $order->loadMissing([
            'user',
            'items.product',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' =>
                'Delivery tracking updated successfully.',

            'data' =>
                new OrderResource(
                    $order
                ),
        ]);
    }
}