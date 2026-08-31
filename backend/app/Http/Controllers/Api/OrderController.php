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
    |
    | Supports:
    |
    | 1. Logged-in + Home Delivery
    | 2. Logged-in + Pickup
    | 3. Guest + Home Delivery
    | 4. Guest + Pickup
    |
    */

    public function store(
        StoreOrderRequest $request
    ): JsonResponse {
        /*
         * Public route হলেও যদি Authorization
         * Bearer token থাকে, Sanctum user পাওয়া যাবে।
         */
        $user =
            $request->user('sanctum');

        /*
         * Guest cart token.
         */
        $guestToken =
            $this->getGuestToken(
                $request
            );

        /*
         * home_delivery / pickup
         */
        $deliveryMethod =
            (string) $request->input(
                'delivery_method',
                'home_delivery'
            );

        /*
         * Saved shipping address.
         */
        $shippingAddressId =
            $request->filled(
                'shipping_address_id'
            )
                ? $request->integer(
                    'shipping_address_id'
                )
                : null;

        /*
         * Payment method.
         */
        $paymentMethod =
            PaymentMethod::from(
                (string) $request->input(
                    'payment_method'
                )
            );

        /*
         * Guest customer information.
         */
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

        /*
         * Optional online-payment data.
         */
        $gatewayPayload =
            $request->input(
                'gateway_payload',
                []
            );

        /*
         * Create order.
         */
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
                    'items.product.images',
                    'items.variant',
                    'shippingAddress',
                    'payment',
                ])
                ->latest();

        /*
         * Customer only sees their own orders.
         * Admin sees all orders.
         */
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
    | Guest Order Tracking
    |--------------------------------------------------------------------------
    |
    | Guest customers can view only their own order.
    | The X-Guest-Cart-Token header must match
    | the guest_token stored with the order.
    |
    */

    public function guestShow(
        Request $request,
        Order $order
    ): JsonResponse {
        /*
         * Get guest token from request header.
         */
        $guestToken =
            $this->getGuestToken(
                $request
            );

        /*
         * Token is required for guest tracking.
         */
        if (! $guestToken) {
            return response()->json([
                'message' =>
                    'Guest cart token is required.',
            ], 401);
        }

        /*
         * Make sure this order belongs to
         * the guest making the request.
         */
        if (
            ! $order->guest_token ||
            ! hash_equals(
                (string) $order->guest_token,
                (string) $guestToken
            )
        ) {
            return response()->json([
                'message' =>
                    'Order not found.',
            ], 404);
        }

        /*
         * Load complete order information.
         */
        $order->load([
            'user',
            'items.product.images',
            'items.variant',
            'shippingAddress',
            'payment',
        ]);

        return response()->json([
            'message' =>
                'Order retrieved successfully.',

            'data' =>
                new OrderResource(
                    $order
                ),
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
            'items.product.images',
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
    $validated = $request->validate([
        'delivery_person_name' => [
            'nullable',
            'string',
            'max:255',
        ],

        'delivery_person_phone' => [
            'nullable',
            'string',
            'max:50',
        ],

        'tracking_number' => [
            'nullable',
            'string',
            'max:255',
        ],

        'delivery_status' => [
            'nullable',
            'string',
            'max:100',
        ],

        'delivery_note' => [
            'nullable',
            'string',
        ],
    ]);

    $order->update([
        'delivery_person_name' =>
            $validated['delivery_person_name'] ?? null,

        'delivery_person_phone' =>
            $validated['delivery_person_phone'] ?? null,

        'tracking_number' =>
            $validated['tracking_number'] ?? null,

        'delivery_status' =>
            $validated['delivery_status'] ?? null,

        'delivery_note' =>
            $validated['delivery_note'] ?? null,

        'delivery_updated_at' =>
            now(),
    ]);

    $order->load([
        'user',
        'items.product.images',
        'items.variant',
        'shippingAddress',
        'payment',
    ]);

    return response()->json([
        'message' =>
            'Delivery tracking updated successfully.',

        'data' =>
            new OrderResource($order),
    ]);
}
}