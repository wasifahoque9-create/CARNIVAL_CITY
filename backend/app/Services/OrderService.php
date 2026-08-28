<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\BusinessSetting;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\OrderStatusChangedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private CartService $cartService,
        private PaymentGatewayService $paymentGatewayService,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Place Order
    |--------------------------------------------------------------------------
    |
    | Supports:
    |
    | - Logged-in + Home Delivery
    | - Logged-in + Pickup
    | - Guest + Home Delivery
    | - Guest + Pickup
    |
    | Important:
    | Every newly placed order remains PENDING.
    | Admin must accept the order.
    |
    */

    public function placeOrder(
        ?User $user,
        ?string $guestToken,
        ?int $shippingAddressId,
        PaymentMethod $method,
        string $deliveryMethod,
        array $guestData = [],
        array $gatewayPayload = [],
    ): Order {
        /*
        |--------------------------------------------------------------------------
        | Validate Delivery Method
        |--------------------------------------------------------------------------
        */

        if (
            ! in_array(
                $deliveryMethod,
                [
                    'home_delivery',
                    'pickup',
                ],
                true
            )
        ) {
            throw ValidationException::withMessages([
                'delivery_method' => [
                    'Invalid delivery method.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Cart
        |--------------------------------------------------------------------------
        */

        $summary =
            $this->cartService
                ->getCartSummary(
                    $user,
                    $guestToken
                );

        $cart = $summary['cart'];

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => [
                    'Cannot place an order with an empty cart.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Delivery / Pickup
        |--------------------------------------------------------------------------
        */

        $isHomeDelivery =
            $deliveryMethod ===
            'home_delivery';

        $address = null;

        /*
         * Logged-in + Home Delivery:
         * saved address required.
         */
        if (
            $user &&
            $isHomeDelivery
        ) {
            if (! $shippingAddressId) {
                throw ValidationException::withMessages([
                    'shipping_address_id' => [
                        'Please select a shipping address.',
                    ],
                ]);
            }

            $address =
                $user
                    ->addresses()
                    ->findOrFail(
                        $shippingAddressId
                    );
        }

        /*
         * Guest checkout needs
         * guest cart token.
         */
        if (
            ! $user &&
            ! $guestToken
        ) {
            throw ValidationException::withMessages([
                'guest_token' => [
                    'Guest cart token is required.',
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Delivery Charge
        |--------------------------------------------------------------------------
        |
        | Home Delivery:
        | Business Settings delivery charge.
        |
        | Pickup:
        | Always 0.
        |
        */

        $deliveryCharge = 0.0;

        if ($isHomeDelivery) {
            $businessSettings =
                BusinessSetting::query()
                    ->first();

            $deliveryCharge =
                max(
                    0,
                    (float) (
                        $businessSettings
                            ?->delivery_charge
                        ?? 0
                    )
                );
        }

        /*
         * Cart total + delivery charge.
         */
        $orderTotal =
            round(
                (float) $summary['total']
                +
                $deliveryCharge,
                2
            );

        /*
        |--------------------------------------------------------------------------
        | Transaction
        |--------------------------------------------------------------------------
        */

        return DB::transaction(
            function () use (
                $user,
                $guestToken,
                $guestData,
                $cart,
                $address,
                $method,
                $gatewayPayload,
                $deliveryMethod,
                $deliveryCharge,
                $orderTotal,
                $isHomeDelivery
            ) {
                /*
                |--------------------------------------------------------------------------
                | Create Order
                |--------------------------------------------------------------------------
                */

                $order =
                    Order::create([
                        'user_id' =>
                            $user?->id,

                        /*
                         * New order ALWAYS starts pending.
                         */
                        'status' =>
                            OrderStatus::Pending,

                        'total_amount' =>
                            $orderTotal,

                        /*
                         * Pickup does not need
                         * shipping address.
                         */
                        'shipping_address_id' =>
                            $isHomeDelivery
                                ? $address?->id
                                : null,

                        'delivery_method' =>
                            $deliveryMethod,

                        'delivery_charge' =>
                            $deliveryCharge,

                        /*
                        |--------------------------------------------------------------------------
                        | Guest Customer
                        |--------------------------------------------------------------------------
                        */

                        'guest_name' =>
                            $user
                                ? null
                                : (
                                    $guestData[
                                        'guest_name'
                                    ] ?? null
                                ),

                        'guest_email' =>
                            $user
                                ? null
                                : (
                                    $guestData[
                                        'guest_email'
                                    ] ?? null
                                ),

                        'guest_phone' =>
                            $user
                                ? null
                                : (
                                    $guestData[
                                        'guest_phone'
                                    ] ?? null
                                ),

                        /*
                        |--------------------------------------------------------------------------
                        | Guest Address
                        |--------------------------------------------------------------------------
                        |
                        | Only saved for
                        | Guest + Home Delivery.
                        |
                        */

                        'guest_address_line1' =>
                            $user ||
                            ! $isHomeDelivery
                                ? null
                                : (
                                    $guestData[
                                        'guest_address_line1'
                                    ] ?? null
                                ),

                        'guest_address_line2' =>
                            $user ||
                            ! $isHomeDelivery
                                ? null
                                : (
                                    $guestData[
                                        'guest_address_line2'
                                    ] ?? null
                                ),

                        'guest_city' =>
                            $user ||
                            ! $isHomeDelivery
                                ? null
                                : (
                                    $guestData[
                                        'guest_city'
                                    ] ?? null
                                ),

                        'guest_postal_code' =>
                            $user ||
                            ! $isHomeDelivery
                                ? null
                                : (
                                    $guestData[
                                        'guest_postal_code'
                                    ] ?? null
                                ),

                        'guest_country' =>
                            $user ||
                            ! $isHomeDelivery
                                ? null
                                : (
                                    $guestData[
                                        'guest_country'
                                    ] ?? null
                                ),

                        'guest_token' =>
                            $user
                                ? null
                                : $guestToken,
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Order Items
                |--------------------------------------------------------------------------
                */

                foreach (
                    $cart->items as $item
                ) {
                    OrderItem::create([
                        'order_id' =>
                            $order->id,

                        'product_id' =>
                            $item->product_id,

                        'product_variant_id' =>
                            $item
                                ->product_variant_id,

                        'quantity' =>
                            $item->quantity,

                        'unit_price' =>
                            $item->unitPrice(),
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | Payment
                |--------------------------------------------------------------------------
                */

                $payment =
                    Payment::create([
                        'order_id' =>
                            $order->id,

                        'method' =>
                            $method,

                        'status' =>
                            PaymentStatus::Pending,

                        'amount' =>
                            $orderTotal,
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Cash on Delivery
                |--------------------------------------------------------------------------
                |
                | Payment remains pending.
                | Order also remains pending.
                |
                */

                if (
                    $method ===
                    PaymentMethod::Cod
                ) {
                    $payment->update([
                        'status' =>
                            PaymentStatus::Pending,

                        'transaction_ref' =>
                            'COD-' .
                            $order->id,
                    ]);
                } else {
                    /*
                    |--------------------------------------------------------------------------
                    | Online Payment
                    |--------------------------------------------------------------------------
                    |
                    | Payment may become PAID.
                    | Order still stays PENDING
                    | until admin accepts it.
                    |
                    */

                    $result =
                        $this
                            ->paymentGatewayService
                            ->processPayment(
                                $order,
                                $orderTotal,
                                $gatewayPayload
                            );

                    if (
                        $result[
                            'success'
                        ]
                    ) {
                        $payment->update([
                            'status' =>
                                PaymentStatus::Paid,

                            'transaction_ref' =>
                                $result[
                                    'transaction_ref'
                                ],
                        ]);
                    } else {
                        $payment->update([
                            'status' =>
                                PaymentStatus::Failed,
                        ]);

                        throw ValidationException::withMessages([
                            'payment' => [
                                $result[
                                    'message'
                                ]
                                ??
                                'Payment failed.',
                            ],
                        ]);
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Clear Cart
                |--------------------------------------------------------------------------
                */

                $this
                    ->cartService
                    ->clearCart(
                        $user,
                        $guestToken
                    );

                /*
                |--------------------------------------------------------------------------
                | Load Relations
                |--------------------------------------------------------------------------
                */

                $order->load([
                    'items.product',
                    'items.variant',
                    'shippingAddress',
                    'payment',
                ]);

                /*
                 * Only registered users
                 * have account notifications.
                 */
                if ($user) {
                    $user->notify(
                        new OrderPlacedNotification(
                            $order
                        )
                    );
                }

                return $order;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Customer Cancel Order
    |--------------------------------------------------------------------------
    |
    | Pending:
    | no stock was deducted.
    |
    | Confirmed/Accepted:
    | stock was deducted,
    | therefore restore it.
    |
    */

    public function cancelOrder(
        User $user,
        Order $order
    ): Order {
        if (
            $order->user_id !==
                $user->id
            &&
            ! $user->isAdmin()
        ) {
            abort(
                403,
                'You are not authorized to cancel this order.'
            );
        }

        if (
            ! $order
                ->status
                ->canBeCancelledByCustomer()
        ) {
            throw ValidationException::withMessages([
                'order' => [
                    'Order can only be cancelled before shipment.',
                ],
            ]);
        }

        return DB::transaction(
            function () use (
                $order,
                $user
            ) {
                $previousStatus =
                    $order->status;

                /*
                 * Only confirmed/accepted order
                 * has deducted inventory.
                 */
                if (
                    $previousStatus ===
                    OrderStatus::Confirmed
                ) {
                    $this->restoreStock(
                        $order
                    );
                }

                $order->update([
                    'status' =>
                        OrderStatus::Cancelled,
                ]);

                $order->load([
                    'items.product',
                    'items.variant',
                    'shippingAddress',
                    'payment',
                ]);

                $user->notify(
                    new OrderStatusChangedNotification(
                        $order,
                        $previousStatus->value
                    )
                );

                return $order;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Update Status
    |--------------------------------------------------------------------------
    |
    | Allowed flow:
    |
    | Pending
    | → Confirmed/Accepted
    | → Shipped
    | → Delivered
    |
    | Pending → Cancelled
    | Confirmed → Cancelled
    |
    */

    public function updateStatus(
        Order $order,
        OrderStatus $status
    ): Order {
        return DB::transaction(
            function () use (
                $order,
                $status
            ) {
                /*
                 * Refresh latest status.
                 */
                $order->refresh();

                $previousStatus =
                    $order->status;

                /*
                 * Same status:
                 * simply return order.
                 */
                if (
                    $previousStatus ===
                    $status
                ) {
                    return $order->load([
                        'items.product',
                        'items.variant',
                        'shippingAddress',
                        'payment',
                        'user',
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | Validate Status Transition
                |--------------------------------------------------------------------------
                */

                if (
                    ! $previousStatus
                        ->canTransitionTo(
                            $status
                        )
                ) {
                    throw ValidationException::withMessages([
                        'status' => [
                            sprintf(
                                'Order cannot move from %s to %s.',
                                $previousStatus
                                    ->label(),
                                $status
                                    ->label()
                            ),
                        ],
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | Pending → Accepted
                |--------------------------------------------------------------------------
                |
                | Inventory is deducted ONLY
                | when admin accepts order.
                |
                */

                if (
                    $previousStatus ===
                        OrderStatus::Pending
                    &&
                    $status ===
                        OrderStatus::Confirmed
                ) {
                    $this->decrementStock(
                        $order
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Accepted → Cancelled
                |--------------------------------------------------------------------------
                |
                | Accepted order already deducted
                | stock, so restore it.
                |
                */

                if (
                    $previousStatus ===
                        OrderStatus::Confirmed
                    &&
                    $status ===
                        OrderStatus::Cancelled
                ) {
                    $this->restoreStock(
                        $order
                    );
                }

                /*
                 * Pending → Cancelled:
                 * nothing to restore because stock
                 * was never deducted.
                 */

                $order->update([
                    'status' =>
                        $status,
                ]);

                $order->load([
                    'items.product',
                    'items.variant',
                    'shippingAddress',
                    'payment',
                    'user',
                ]);

                /*
                 * Notify registered customer.
                 */
                if ($order->user) {
                    $order
                        ->user
                        ->notify(
                            new OrderStatusChangedNotification(
                                $order,
                                $previousStatus->value
                            )
                        );
                }

                return $order;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Confirm Order
    |--------------------------------------------------------------------------
    |
    | Kept for compatibility with other code.
    |
    | New checkout does NOT call this automatically.
    |
    */

    public function confirmOrder(
        Order $order
    ): void {
        $order->refresh();

        if (
            $order->status ===
            OrderStatus::Confirmed
        ) {
            return;
        }

        if (
            $order->status !==
            OrderStatus::Pending
        ) {
            throw ValidationException::withMessages([
                'status' => [
                    'Only a pending order can be accepted.',
                ],
            ]);
        }

        DB::transaction(
            function () use ($order) {
                $this->decrementStock(
                    $order
                );

                $order->update([
                    'status' =>
                        OrderStatus::Confirmed,
                ]);
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Decrement Stock
    |--------------------------------------------------------------------------
    |
    | Happens when Admin accepts order.
    |
    */

    private function decrementStock(
        Order $order
    ): void {
        $order->loadMissing(
            'items.product',
            'items.variant'
        );

        foreach (
            $order->items as $item
        ) {
            if (
                $item->product_variant_id
                &&
                $item->variant
            ) {
                $updated =
                    ProductVariant::query()
                        ->where(
                            'id',
                            $item
                                ->variant
                                ->id
                        )
                        ->where(
                            'stock_qty',
                            '>=',
                            $item
                                ->quantity
                        )
                        ->decrement(
                            'stock_qty',
                            $item
                                ->quantity
                        );

                if ($updated === 0) {
                    throw ValidationException::withMessages([
                        'stock' => [
                            'Insufficient stock for ' .
                            (
                                $item->product
                                    ?->name
                                ??
                                'one of the ordered products'
                            ) .
                            '.',
                        ],
                    ]);
                }
            } else {
                $updated =
                    Product::query()
                        ->where(
                            'id',
                            $item
                                ->product_id
                        )
                        ->where(
                            'stock_qty',
                            '>=',
                            $item
                                ->quantity
                        )
                        ->decrement(
                            'stock_qty',
                            $item
                                ->quantity
                        );

                if ($updated === 0) {
                    throw ValidationException::withMessages([
                        'stock' => [
                            'Insufficient stock for ' .
                            (
                                $item->product
                                    ?->name
                                ??
                                'one of the ordered products'
                            ) .
                            '.',
                        ],
                    ]);
                }
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Stock
    |--------------------------------------------------------------------------
    |
    | Used when an accepted order
    | is cancelled before shipping.
    |
    */

    private function restoreStock(
        Order $order
    ): void {
        $order->loadMissing(
            'items.product',
            'items.variant'
        );

        foreach (
            $order->items as $item
        ) {
            if (
                $item->product_variant_id
                &&
                $item->variant
            ) {
                ProductVariant::query()
                    ->where(
                        'id',
                        $item
                            ->variant
                            ->id
                    )
                    ->increment(
                        'stock_qty',
                        $item
                            ->quantity
                    );
            } else {
                Product::query()
                    ->where(
                        'id',
                        $item
                            ->product_id
                    )
                    ->increment(
                        'stock_qty',
                        $item
                            ->quantity
                    );
            }
        }
    }
}