<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\OrderStatusChangedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderService
{
    public function __construct(
        private CartService $cartService,
        private PaymentGatewayService $paymentGatewayService,
    ) {}

    public function placeOrder(
        User $user,
        int $shippingAddressId,
        PaymentMethod $method,
        array $gatewayPayload = []
    ): Order {
        $summary = $this->cartService->getCartSummary($user);
        $cart = $summary['cart'];

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Cannot place an order with an empty cart.'],
            ]);
        }

        $address = $user->addresses()->findOrFail(
            $shippingAddressId
        );

        return DB::transaction(function () use (
            $user,
            $cart,
            $summary,
            $address,
            $method,
            $gatewayPayload
        ) {
            $order = Order::create([
                'user_id' => $user->id,
                'status' => OrderStatus::Pending,
                'total_amount' => $summary['total'],
                'shipping_address_id' => $address->id,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' =>
                        $item->product_variant_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unitPrice(),
                ]);
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => $method,
                'status' => PaymentStatus::Pending,
                'amount' => $summary['total'],
            ]);

            if ($method === PaymentMethod::Cod) {
                $payment->update([
                    'status' => PaymentStatus::Paid,
                    'transaction_ref' => 'COD-'.$order->id,
                ]);

                $this->confirmOrder($order);
            } else {
                $result =
                    $this->paymentGatewayService
                        ->processPayment(
                            $order,
                            $summary['total'],
                            $gatewayPayload
                        );

                if ($result['success']) {
                    $payment->update([
                        'status' =>
                            PaymentStatus::Paid,
                        'transaction_ref' =>
                            $result['transaction_ref'],
                    ]);

                    $this->confirmOrder($order);
                } else {
                    $payment->update([
                        'status' =>
                            PaymentStatus::Failed,
                    ]);

                    throw ValidationException::withMessages([
                        'payment' => [
                            $result['message']
                                ?? 'Payment failed.',
                        ],
                    ]);
                }
            }

            /*
             * Checkout is successful at this point,
             * so clear the registered customer's cart.
             */
            $this->cartService->clearCart($user);

            /*
             * Load everything required by:
             * - Admin order details
             * - Customer confirmation email
             */
            $order->load([
                'user',
                'items.product.images',
                'items.variant',
                'shippingAddress',
                'payment',
            ]);

            /*
             * Email failure must never make
             * checkout fail or roll back the order.
             */
            try {
                $user->notify(
                    new OrderPlacedNotification($order)
                );
            } catch (Throwable $exception) {
                Log::warning(
                    'Order confirmation email failed.',
                    [
                        'order_id' => $order->id,
                        'customer_type' => 'registered',
                        'error' =>
                            $exception->getMessage(),
                    ]
                );
            }

            return $order;
        });
    }

    public function placeGuestOrder(
        Cart $cart,
        array $guestData,
        PaymentMethod $method,
        array $gatewayPayload = []
    ): Order {
        $summary =
            $this->cartService->getCartSummary($cart);

        $cart = $summary['cart'];

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => [
                    'Cannot place an order with an empty cart.',
                ],
            ]);
        }

        return DB::transaction(function () use (
            $cart,
            $summary,
            $guestData,
            $method,
            $gatewayPayload
        ) {
            $order = Order::create([
                'user_id' => null,
                'shipping_address_id' => null,

                'status' => OrderStatus::Pending,
                'total_amount' => $summary['total'],

                'guest_name' =>
                    $guestData['guest_name'],

                'guest_phone' =>
                    $guestData['guest_phone'],

                'guest_email' =>
                    $guestData['guest_email']
                    ?? null,

                'guest_address_line1' =>
                    $guestData['guest_address_line1'],

                'guest_address_line2' =>
                    $guestData['guest_address_line2']
                    ?? null,

                'guest_city' =>
                    $guestData['guest_city'],

                'guest_area' =>
                    $guestData['guest_area'],

                'guest_postal_code' =>
                    $guestData['guest_postal_code']
                    ?? null,

                'guest_notes' =>
                    $guestData['guest_notes']
                    ?? null,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' =>
                        $item->product_id,
                    'product_variant_id' =>
                        $item->product_variant_id,
                    'quantity' =>
                        $item->quantity,
                    'unit_price' =>
                        $item->unitPrice(),
                ]);
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => $method,
                'status' => PaymentStatus::Pending,
                'amount' => $summary['total'],
            ]);

            if ($method === PaymentMethod::Cod) {
                $payment->update([
                    'status' =>
                        PaymentStatus::Paid,
                    'transaction_ref' =>
                        'COD-'.$order->id,
                ]);

                $this->confirmOrder($order);
            } else {
                $result =
                    $this->paymentGatewayService
                        ->processPayment(
                            $order,
                            $summary['total'],
                            $gatewayPayload
                        );

                if ($result['success']) {
                    $payment->update([
                        'status' =>
                            PaymentStatus::Paid,
                        'transaction_ref' =>
                            $result[
                                'transaction_ref'
                            ],
                    ]);

                    $this->confirmOrder($order);
                } else {
                    $payment->update([
                        'status' =>
                            PaymentStatus::Failed,
                    ]);

                    throw ValidationException::withMessages([
                        'payment' => [
                            $result['message']
                                ?? 'Payment failed.',
                        ],
                    ]);
                }
            }

            /*
             * Clear guest cart after
             * successful checkout.
             */
            $this->cartService->clearCart($cart);

            /*
             * Remove empty guest cart record.
             */
            $cart->delete();

            /*
             * Load relations required by admin
             * details and confirmation email.
             */
            $order->load([
                'user',
                'items.product.images',
                'items.variant',
                'shippingAddress',
                'payment',
            ]);

            /*
             * Email failure must NOT roll
             * back guest checkout.
             */
            if ($order->guest_email) {
                try {
                    Notification::route(
                        'mail',
                        $order->guest_email
                    )->notify(
                        new OrderPlacedNotification(
                            $order
                        )
                    );
                } catch (Throwable $exception) {
                    Log::warning(
                        'Guest order confirmation email failed.',
                        [
                            'order_id' =>
                                $order->id,

                            'customer_type' =>
                                'guest',

                            'error' =>
                                $exception
                                    ->getMessage(),
                        ]
                    );
                }
            }

            return $order;
        });
    }

    public function cancelOrder(
        User $user,
        Order $order
    ): Order {
        if (
            $order->user_id !== $user->id
            && ! $user->isAdmin()
        ) {
            abort(
                403,
                'You are not authorized to cancel this order.'
            );
        }

        if (
            ! $order->status
                ->canBeCancelledByCustomer()
        ) {
            throw ValidationException::withMessages([
                'order' => [
                    'Order can only be cancelled before shipment.',
                ],
            ]);
        }

        return DB::transaction(
            function () use ($order, $user) {
                $previousStatus =
                    $order->status;

                $order->update([
                    'status' =>
                        OrderStatus::Cancelled,
                ]);

                $this->restoreStock($order);

                if (
                    $order->payment
                    && $order->payment->status ===
                        PaymentStatus::Paid
                ) {
                    $order->payment->update([
                        'status' =>
                            PaymentStatus::Refunded,
                    ]);
                }

                $order->load([
                    'items.product.images',
                    'items.variant',
                    'shippingAddress',
                    'payment',
                ]);

                /*
                 * Notification failure must not
                 * make cancellation fail.
                 */
                try {
                    $user->notify(
                        new OrderStatusChangedNotification(
                            $order,
                            $previousStatus->value
                        )
                    );
                } catch (Throwable $exception) {
                    Log::warning(
                        'Order cancellation notification failed.',
                        [
                            'order_id' =>
                                $order->id,

                            'error' =>
                                $exception
                                    ->getMessage(),
                        ]
                    );
                }

                return $order;
            }
        );
    }

    public function updateStatus(
        Order $order,
        OrderStatus $status
    ): Order {
        return DB::transaction(
            function () use ($order, $status) {
                $previousStatus =
                    $order->status;

                if (
                    $status ===
                    OrderStatus::Cancelled
                ) {
                    if (
                        ! $order->status
                            ->isPreShipment()
                    ) {
                        throw ValidationException::withMessages([
                            'status' => [
                                'Cannot cancel an order that has already shipped.',
                            ],
                        ]);
                    }

                    $this->restoreStock($order);
                }

                if (
                    $status ===
                        OrderStatus::Confirmed
                    && $order->status ===
                        OrderStatus::Pending
                ) {
                    $this->decrementStock(
                        $order
                    );
                }

                $order->update([
                    'status' => $status,
                ]);

                $order->load([
                    'items.product.images',
                    'items.variant',
                    'shippingAddress',
                    'payment',
                    'user',
                ]);

                /*
                 * Guest orders have no User model.
                 * Notification failure must not
                 * block admin status changes.
                 */
                if ($order->user) {
                    try {
                        $order->user->notify(
                            new OrderStatusChangedNotification(
                                $order,
                                $previousStatus->value
                            )
                        );
                    } catch (
                        Throwable $exception
                    ) {
                        Log::warning(
                            'Order status notification failed.',
                            [
                                'order_id' =>
                                    $order->id,

                                'error' =>
                                    $exception
                                        ->getMessage(),
                            ]
                        );
                    }
                }

                return $order;
            }
        );
    }

    public function confirmOrder(
        Order $order
    ): void {
        if (
            $order->status ===
            OrderStatus::Confirmed
        ) {
            return;
        }

        $this->decrementStock($order);

        $order->update([
            'status' =>
                OrderStatus::Confirmed,
        ]);
    }

    private function decrementStock(
        Order $order
    ): void {
        $order->loadMissing(
            'items.product',
            'items.variant'
        );

        foreach ($order->items as $item) {
            if (
                $item->product_variant_id
                && $item->variant
            ) {
                ProductVariant::where(
                    'id',
                    $item->variant->id
                )
                    ->where(
                        'stock_qty',
                        '>=',
                        $item->quantity
                    )
                    ->decrement(
                        'stock_qty',
                        $item->quantity
                    );
            } else {
                Product::where(
                    'id',
                    $item->product_id
                )
                    ->where(
                        'stock_qty',
                        '>=',
                        $item->quantity
                    )
                    ->decrement(
                        'stock_qty',
                        $item->quantity
                    );
            }
        }
    }

    private function restoreStock(
        Order $order
    ): void {
        $order->loadMissing(
            'items.product',
            'items.variant'
        );

        foreach ($order->items as $item) {
            if (
                $item->product_variant_id
                && $item->variant
            ) {
                ProductVariant::where(
                    'id',
                    $item->variant->id
                )
                    ->increment(
                        'stock_qty',
                        $item->quantity
                    );
            } else {
                Product::where(
                    'id',
                    $item->product_id
                )
                    ->increment(
                        'stock_qty',
                        $item->quantity
                    );
            }
        }
    }
}