<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation #{{ $order->id }}</title>
</head>

<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

<table width="100%" cellpadding="0" cellspacing="0"
       style="background:#f4f5f7;padding:30px 15px;">
    <tr>
        <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0"
                   style="max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;">

                {{-- Header --}}
                <tr>
                    <td style="background:#121358;padding:28px;text-align:center;color:#ffffff;">
                        <h1 style="margin:0;font-size:26px;">
                            Order Confirmed
                        </h1>

                        <p style="margin:8px 0 0;">
                            Order #{{ $order->id }}
                        </p>
                    </td>
                </tr>

                {{-- Greeting --}}
                <tr>
                    <td style="padding:28px;">
                        <h2 style="margin:0 0 10px;">
                            Hello {{ $customerName }}!
                        </h2>

                        <p style="margin:0;color:#6b7280;line-height:1.6;">
                            Your order has been placed successfully.
                            Here are your order details.
                        </p>
                    </td>
                </tr>

                @php
                    $paymentMethod = $order->payment?->method;

                    if ($paymentMethod instanceof \BackedEnum) {
                        $paymentMethod = $paymentMethod->value;
                    }
                @endphp

                {{-- Order info --}}
                <tr>
                    <td style="padding:0 28px 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0"
                               style="background:#f9fafb;border-radius:10px;">

                            <tr>
                                <td style="padding:14px 16px;color:#6b7280;">
                                    Order Number
                                </td>
                                <td align="right"
                                    style="padding:14px 16px;font-weight:bold;">
                                    #{{ $order->id }}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:10px 16px;color:#6b7280;">
                                    Status
                                </td>
                                <td align="right"
                                    style="padding:10px 16px;font-weight:bold;text-transform:capitalize;">
                                    {{ $order->status->value }}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:10px 16px 14px;color:#6b7280;">
                                    Payment Method
                                </td>
                                <td align="right"
                                    style="padding:10px 16px 14px;font-weight:bold;text-transform:uppercase;">
                                    {{ $paymentMethod ?? 'N/A' }}
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>

                {{-- Products --}}
                <tr>
                    <td style="padding:0 28px 25px;">

                        <h3 style="margin:0 0 16px;">
                            Your Items
                        </h3>

                        @foreach($order->items as $item)

                            @php
                                $product = $item->product;

                                $productImage =
                                    $product?->images?->firstWhere('is_primary', true)
                                    ?? $product?->images?->first();

                                $imageUrl = $productImage?->url;

                                $lineTotal =
                                    (float) $item->unit_price
                                    * (int) $item->quantity;
                            @endphp

                            <table width="100%" cellpadding="0" cellspacing="0"
                                   style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:14px;">
                                <tr>

                                    <td width="105"
                                        style="padding:14px;vertical-align:top;">

                                        @if($imageUrl)
                                            <img
                                                src="{{ $imageUrl }}"
                                                alt="{{ $product?->name ?? 'Product' }}"
                                                width="80"
                                                height="80"
                                                style="display:block;width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;"
                                            >
                                        @else
                                            <div style="width:80px;height:80px;background:#f3f4f6;border-radius:8px;text-align:center;line-height:80px;font-size:11px;color:#9ca3af;">
                                                No Image
                                            </div>
                                        @endif

                                    </td>

                                    <td style="padding:14px 14px 14px 0;vertical-align:top;">

                                        <div style="font-size:16px;font-weight:bold;margin-bottom:6px;">
                                            {{ $product?->name ?? 'Product #'.$item->product_id }}
                                        </div>

                                        @if($item->variant)
                                            <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">
                                                {{ $item->variant->variant_name }}:
                                                {{ $item->variant->variant_value }}
                                            </div>
                                        @endif

                                        <div style="font-size:13px;color:#6b7280;">
                                            Quantity:
                                            <strong>{{ $item->quantity }}</strong>
                                        </div>

                                        <div style="font-size:13px;color:#6b7280;margin-top:4px;">
                                            Unit Price:
                                            <strong>
                                                ${{ number_format((float) $item->unit_price, 2) }}
                                            </strong>
                                        </div>

                                        <div style="font-size:14px;margin-top:8px;">
                                            Item Total:
                                            <strong>
                                                ${{ number_format($lineTotal, 2) }}
                                            </strong>
                                        </div>

                                    </td>
                                </tr>
                            </table>

                        @endforeach

                    </td>
                </tr>

                {{-- Total --}}
                <tr>
                    <td style="padding:0 28px 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0"
                               style="background:#121358;color:#ffffff;border-radius:10px;">
                            <tr>
                                <td style="padding:18px;font-size:17px;font-weight:bold;">
                                    Order Total
                                </td>

                                <td align="right"
                                    style="padding:18px;font-size:20px;font-weight:bold;">
                                    ${{ number_format((float) $order->total_amount, 2) }}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Delivery --}}
                <tr>
                    <td style="padding:0 28px 28px;">

                        <h3 style="margin:0 0 14px;">
                            Delivery Information
                        </h3>

                        @if($order->user_id && $order->shippingAddress)

                            <p style="margin:0;line-height:1.7;color:#4b5563;">
                                <strong>{{ $order->user?->name }}</strong>

                                @if($order->user?->phone)
                                    <br>{{ $order->user->phone }}
                                @endif

                                <br>{{ $order->shippingAddress->line1 }}

                                @if($order->shippingAddress->line2)
                                    <br>{{ $order->shippingAddress->line2 }}
                                @endif

                                <br>{{ $order->shippingAddress->city }}

                                @if($order->shippingAddress->postal_code)
                                    , {{ $order->shippingAddress->postal_code }}
                                @endif
                            </p>

                        @else

                            <p style="margin:0;line-height:1.7;color:#4b5563;">
                                <strong>{{ $order->guest_name }}</strong>

                                <br>{{ $order->guest_phone }}

                                @if($order->guest_email)
                                    <br>{{ $order->guest_email }}
                                @endif

                                <br>{{ $order->guest_address_line1 }}

                                @if($order->guest_address_line2)
                                    <br>{{ $order->guest_address_line2 }}
                                @endif

                                @if($order->guest_area)
                                    <br>{{ $order->guest_area }}
                                @endif

                                <br>{{ $order->guest_city }}

                                @if($order->guest_postal_code)
                                    , {{ $order->guest_postal_code }}
                                @endif
                            </p>

                        @endif

                    </td>
                </tr>

                @if($order->guest_notes)
                    <tr>
                        <td style="padding:0 28px 28px;">
                            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">
                                <strong>Order Notes</strong>

                                <p style="margin:8px 0 0;color:#92400e;">
                                    {{ $order->guest_notes }}
                                </p>
                            </div>
                        </td>
                    </tr>
                @endif

                {{-- Footer --}}
                <tr>
                    <td style="background:#f9fafb;padding:22px;text-align:center;color:#6b7280;font-size:13px;">
                        Thank you for shopping with ShopSphere!
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

</body>
</html>