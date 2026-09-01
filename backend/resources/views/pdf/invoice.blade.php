<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <title>
        Invoice #{{ str_pad((string) $order->id, 6, '0', STR_PAD_LEFT) }}
    </title>

    <style>
        @page {
            margin: 28px 32px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #1f2937;
            background: #ffffff;
        }

        .invoice {
            width: 100%;
        }

        .top-bar {
            height: 6px;
            background: #121358;
            margin-bottom: 22px;
        }

        .header-table,
        .info-table,
        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: top;
        }

        .brand-name {
            margin: 0;
            font-size: 25px;
            font-weight: bold;
            color: #121358;
        }

        .brand-subtitle {
            margin-top: 4px;
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .business-info {
            margin-top: 10px;
            color: #4b5563;
            line-height: 1.7;
        }

        .invoice-title {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            text-align: right;
            color: #121358;
        }

        .invoice-number {
            margin-top: 6px;
            text-align: right;
            font-size: 13px;
            font-weight: bold;
            color: #f59e0b;
        }

        .invoice-date {
            margin-top: 6px;
            text-align: right;
            color: #6b7280;
        }

        .section {
            margin-top: 25px;
        }

        .section-title {
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: bold;
            color: #f59e0b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .info-box {
            width: 100%;
            padding: 13px 15px;
            border: 1px solid #e5e7eb;
            background: #f8f8ff;
        }

        .info-table td {
            width: 50%;
            vertical-align: top;
        }

        .info-table .left {
            padding-right: 8px;
        }

        .info-table .right {
            padding-left: 8px;
        }

        .info-label {
            margin-bottom: 3px;
            font-size: 9px;
            font-weight: bold;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .info-value {
            font-size: 12px;
            font-weight: bold;
            color: #121358;
        }

        .info-text {
            margin-top: 3px;
            color: #4b5563;
        }

        .items-table {
            width: 100%;
            margin-top: 8px;
            border-collapse: collapse;
        }

        .items-table thead th {
            padding: 10px 8px;
            background: #121358;
            color: #ffffff;
            font-size: 10px;
            text-align: left;
            text-transform: uppercase;
        }

        .items-table thead th.center {
            text-align: center;
        }

        .items-table thead th.right {
            text-align: right;
        }

        .items-table tbody td {
            padding: 11px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }

        .items-table tbody tr:nth-child(even) {
            background: #fafafa;
        }

        .product-name {
            font-weight: bold;
            color: #121358;
        }

        .variant {
            margin-top: 3px;
            font-size: 10px;
            color: #6b7280;
        }

        .center {
            text-align: center;
        }

        .right {
            text-align: right;
        }

        .summary-wrapper {
            width: 100%;
            margin-top: 20px;
        }

        .summary-spacer {
            width: 52%;
        }

        .summary-box {
            width: 48%;
        }

        .summary-table td {
            padding: 7px 9px;
        }

        .summary-label {
            color: #6b7280;
        }

        .summary-value {
            text-align: right;
            font-weight: bold;
            color: #121358;
        }

        .summary-total td {
            padding-top: 11px;
            padding-bottom: 11px;
            border-top: 2px solid #121358;
            font-size: 15px;
            font-weight: bold;
            color: #121358;
        }

        .summary-total .summary-value {
            color: #f59e0b;
            font-size: 17px;
        }

        .status-box {
            margin-top: 22px;
            padding: 12px 15px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
        }

        .status-table {
            width: 100%;
            border-collapse: collapse;
        }

        .status-table td {
            width: 33.33%;
            vertical-align: top;
        }

        .status-label {
            font-size: 9px;
            font-weight: bold;
            color: #9ca3af;
            text-transform: uppercase;
        }

        .status-value {
            margin-top: 3px;
            font-weight: bold;
            color: #121358;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 9px;
        }

        .thank-you {
            margin-bottom: 5px;
            font-size: 12px;
            font-weight: bold;
            color: #121358;
        }
    </style>
</head>

<body>

@php
    $invoiceNumber =
        str_pad(
            (string) $order->id,
            6,
            '0',
            STR_PAD_LEFT
        );

    $currency =
        $business->currency ?? 'BDT';

    $subtotal = $order->items->sum(
        function ($item) {
            return
                (float) $item->unit_price
                *
                (int) $item->quantity;
        }
    );

    $deliveryCharge =
        (float) (
            $order->delivery_charge ?? 0
        );

    $deliveryMethod =
        $order->delivery_method === 'pickup'
            ? 'Pickup from Store'
            : 'Home Delivery';

    $orderStatus =
        match ($order->status->value) {
            'pending' => 'Pending',
            'confirmed' => 'Accepted',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            default => ucfirst(
                $order->status->value
            ),
        };

    $paymentMethod =
        match (
            strtolower(
                (string) (
                    $order->payment?->method?->value
                    ??
                    $order->payment?->method
                    ??
                    ''
                )
            )
        ) {
            'cod' => 'Cash on Delivery',
            'gateway' => 'Online Payment',
            default => 'Not Available',
        };

    $paymentStatus =
        $order->payment
            ? ucfirst(
                strtolower(
                    (string) (
                        $order->payment
                            ->status
                            ?->value
                        ??
                        $order->payment
                            ->status
                    )
                )
            )
            : 'Not Available';

    $customerName =
        $order->user?->name
        ??
        $order->guest_name
        ??
        'Customer';

    $customerEmail =
        $order->user?->email
        ??
        $order->guest_email;

    $customerPhone =
        $order->user?->phone
        ??
        $order->guest_phone;
@endphp

<div class="invoice">

    <div class="top-bar"></div>

    {{-- Header --}}
    <table class="header-table">
        <tr>
            <td style="width: 58%;">
                <img
    src="{{ public_path('logo.png') }}"
    alt="Carnival City"
    style="width: 150px; height: auto; margin-bottom: 8px;"
>
                <h1 class="brand-name">
                    {{ $business->business_name ?? 'ShopSphere' }}
                </h1>

                <div class="brand-subtitle">
                    Official Sales Invoice
                </div>

                <div class="business-info">
                    @if($business->business_address)
                        {{ $business->business_address }}
                        <br>
                    @endif

                    @if($business->business_phone)
                        Phone:
                        {{ $business->business_phone }}
                        <br>
                    @endif

                    @if($business->business_email)
                        Email:
                        {{ $business->business_email }}
                    @endif
                </div>
            </td>

            <td style="width: 42%;">
                <h2 class="invoice-title">
                    INVOICE
                </h2>

                <div class="invoice-number">
                    #{{ $invoiceNumber }}
                </div>

                <div class="invoice-date">
                    {{ $order->created_at->format('d M Y') }}
                    <br>
                    {{ $order->created_at->format('h:i A') }}
                </div>
            </td>
        </tr>
    </table>

    {{-- Customer and Order --}}
    <div class="section">

        <div class="section-title">
            Customer & Order Information
        </div>

        <table class="info-table">
            <tr>
                <td class="left">
                    <div class="info-box">

                        <div class="info-label">
                            Bill To
                        </div>

                        <div class="info-value">
                            {{ $customerName }}
                        </div>

                        @if($customerEmail)
                            <div class="info-text">
                                {{ $customerEmail }}
                            </div>
                        @endif

                        @if($customerPhone)
                            <div class="info-text">
                                {{ $customerPhone }}
                            </div>
                        @endif

                    </div>
                </td>

                <td class="right">
                    <div class="info-box">

                        <div class="info-label">
                            Delivery Method
                        </div>

                        <div class="info-value">
                            {{ $deliveryMethod }}
                        </div>

                        @if(
                            $order->delivery_method ===
                            'pickup'
                        )

                            <div class="info-text">
                                Pickup Location:
                                {{ $business->business_address ?? 'Store Address' }}
                            </div>

                        @elseif(
                            $order->shippingAddress
                        )

                            <div class="info-text">
                                {{ $order->shippingAddress->line1 }}

                                @if($order->shippingAddress->line2)
                                    ,
                                    {{ $order->shippingAddress->line2 }}
                                @endif

                                <br>

                                {{ $order->shippingAddress->city }},
                                {{ $order->shippingAddress->postal_code }}

                                <br>

                                {{ $order->shippingAddress->country }}
                            </div>

                        @elseif($order->guest_address_line1)

                            <div class="info-text">
                                {{ $order->guest_address_line1 }}

                                @if($order->guest_address_line2)
                                    ,
                                    {{ $order->guest_address_line2 }}
                                @endif

                                <br>

                                {{ $order->guest_city }},
                                {{ $order->guest_postal_code }}

                                <br>

                                {{ $order->guest_country }}
                            </div>

                        @endif

                    </div>
                </td>
            </tr>
        </table>

    </div>

    {{-- Products --}}
    <div class="section">

        <div class="section-title">
            Order Items
        </div>

        <table class="items-table">

            <thead>
                <tr>
                    <th style="width: 44%;">
                        Product
                    </th>

                    <th
                        class="center"
                        style="width: 14%;"
                    >
                        Qty
                    </th>

                    <th
                        class="right"
                        style="width: 20%;"
                    >
                        Unit Price
                    </th>

                    <th
                        class="right"
                        style="width: 22%;"
                    >
                        Total
                    </th>
                </tr>
            </thead>

            <tbody>

                @foreach($order->items as $item)

                    @php
                        $lineTotal =
                            (float) $item->unit_price
                            *
                            (int) $item->quantity;
                    @endphp

                    <tr>
                        <td>
                            <div class="product-name">
                                {{ $item->product?->name ?? 'Product' }}
                            </div>

                            @if($item->variant)
                                <div class="variant">
                                    {{ $item->variant->variant_name }}
                                    :
                                    {{ $item->variant->variant_value }}
                                </div>
                            @endif
                        </td>

                        <td class="center">
                            {{ $item->quantity }}
                        </td>

                        <td class="right">
                            {{ $currency }}
                            {{ number_format(
                                (float) $item->unit_price,
                                2
                            ) }}
                        </td>

                        <td class="right">
                            <strong>
                                {{ $currency }}
                                {{ number_format(
                                    $lineTotal,
                                    2
                                ) }}
                            </strong>
                        </td>
                    </tr>

                @endforeach

            </tbody>

        </table>

    </div>

    {{-- Totals --}}
    <table class="summary-wrapper">
        <tr>
            <td class="summary-spacer"></td>

            <td class="summary-box">

                <table class="summary-table">

                    <tr>
                        <td class="summary-label">
                            Subtotal
                        </td>

                        <td class="summary-value">
                            {{ $currency }}
                            {{ number_format(
                                $subtotal,
                                2
                            ) }}
                        </td>
                    </tr>

                    <tr>
                        <td class="summary-label">
                            Delivery Charge
                        </td>

                        <td class="summary-value">
                            @if($deliveryCharge > 0)

                                {{ $currency }}
                                {{ number_format(
                                    $deliveryCharge,
                                    2
                                ) }}

                            @else

                                Free

                            @endif
                        </td>
                    </tr>

                    <tr class="summary-total">
                        <td>
                            Total
                        </td>

                        <td class="summary-value">
                            {{ $currency }}
                            {{ number_format(
                                (float) $order->total_amount,
                                2
                            ) }}
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

    {{-- Order / Payment status --}}
    <div class="status-box">

        <table class="status-table">
            <tr>
                <td>
                    <div class="status-label">
                        Order Status
                    </div>

                    <div class="status-value">
                        {{ $orderStatus }}
                    </div>
                </td>

                <td>
                    <div class="status-label">
                        Payment Method
                    </div>

                    <div class="status-value">
                        {{ $paymentMethod }}
                    </div>
                </td>

                <td>
                    <div class="status-label">
                        Payment Status
                    </div>

                    <div class="status-value">
                        {{ $paymentStatus }}
                    </div>
                </td>
            </tr>
        </table>

    </div>

    {{-- Footer --}}
    <div class="footer">

        <div class="thank-you">
            Thank you for your order.
        </div>

        This invoice was generated automatically by
        {{ $business->business_name ?? 'ShopSphere' }}.

    </div>

</div>

</body>
</html>