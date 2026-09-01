<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <title>
        Quotation #{{ str_pad((string) $quotation->id, 6, '0', STR_PAD_LEFT) }}
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

        .document {
            width: 100%;
        }

        .top-bar {
            height: 6px;
            background: #121358;
            margin-bottom: 22px;
        }

        .header-table,
        .info-table,
        .summary-table,
        .meta-table {
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

        .document-title {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            text-align: right;
            color: #121358;
        }

        .document-number {
            margin-top: 6px;
            text-align: right;
            font-size: 13px;
            font-weight: bold;
            color: #f59e0b;
        }

        .document-date {
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

        .meta-table td {
            width: 33.33%;
            vertical-align: top;
        }

        .meta-label {
            font-size: 9px;
            font-weight: bold;
            color: #9ca3af;
            text-transform: uppercase;
        }

        .meta-value {
            margin-top: 3px;
            font-weight: bold;
            color: #121358;
        }

        .note-box {
            margin-top: 22px;
            padding: 14px 15px;
            border: 1px solid #fde68a;
            background: #fffbeb;
        }

        .note-title {
            font-size: 9px;
            font-weight: bold;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .note-text {
            margin-top: 5px;
            color: #78350f;
            line-height: 1.7;
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
    $quotationNumber =
        str_pad(
            (string) $quotation->id,
            6,
            '0',
            STR_PAD_LEFT
        );

    $currency =
        $business->currency ?? 'BDT';

    $estimatedTotal =
        (float) $quotation->estimated_total;

    $quotedAmount =
        $quotation->quoted_amount !== null
            ? (float) $quotation->quoted_amount
            : null;

    $statusLabel =
        match ($quotation->status) {
            'pending' => 'Pending',
            'reviewed' => 'Reviewed',
            'quoted' => 'Quoted',
            'accepted' => 'Accepted',
            'rejected' => 'Rejected',
            default => ucfirst(
                (string) $quotation->status
            ),
        };
@endphp

<div class="document">

    <div class="top-bar"></div>

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
                    Official Sales Quotation
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
                <h2 class="document-title">
                    QUOTATION
                </h2>

                <div class="document-number">
                    #{{ $quotationNumber }}
                </div>

                <div class="document-date">
                    {{ $quotation->created_at?->format('d M Y') }}
                    <br>
                    {{ $quotation->created_at?->format('h:i A') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section">

        <div class="section-title">
            Customer Information
        </div>

        <table class="info-table">
            <tr>
                <td class="left">
                    <div class="info-box">
                        <div class="info-label">
                            Customer
                        </div>

                        <div class="info-value">
                            {{ $quotation->customer_name }}
                        </div>

                        @if($quotation->customer_email)
                            <div class="info-text">
                                {{ $quotation->customer_email }}
                            </div>
                        @endif

                        @if($quotation->customer_phone)
                            <div class="info-text">
                                {{ $quotation->customer_phone }}
                            </div>
                        @endif
                    </div>
                </td>

                <td class="right">
                    <div class="info-box">
                        <div class="info-label">
                            Company
                        </div>

                        <div class="info-value">
                            {{ $quotation->company_name ?: 'Individual Customer' }}
                        </div>

                        @if($quotation->user)
                            <div class="info-text">
                                Registered customer account
                            </div>
                        @else
                            <div class="info-text">
                                Guest quotation request
                            </div>
                        @endif
                    </div>
                </td>
            </tr>
        </table>

    </div>

    <div class="section">

        <div class="section-title">
            Quotation Items
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

                @foreach($quotation->items as $item)

                    @php
                        $lineTotal =
                            (float) $item->line_total;
                    @endphp

                    <tr>
                        <td>
                            <div class="product-name">
                                {{ $item->product_name ?? 'Product' }}
                            </div>

                            @if($item->variant_name)
                                <div class="variant">
                                    {{ $item->variant_name }}
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

    <table class="summary-wrapper">
        <tr>
            <td class="summary-spacer"></td>

            <td class="summary-box">
                <table class="summary-table">

                    <tr>
                        <td class="summary-label">
                            Estimated Total
                        </td>

                        <td class="summary-value">
                            {{ $currency }}
                            {{ number_format(
                                $estimatedTotal,
                                2
                            ) }}
                        </td>
                    </tr>

                    @if($quotedAmount !== null)
                        <tr>
                            <td class="summary-label">
                                Quoted Amount
                            </td>

                            <td class="summary-value">
                                {{ $currency }}
                                {{ number_format(
                                    $quotedAmount,
                                    2
                                ) }}
                            </td>
                        </tr>
                    @endif

                    <tr class="summary-total">
                        <td>
                            Final Quotation
                        </td>

                        <td class="summary-value">
                            {{ $currency }}
                            {{ number_format(
                                (float) $finalAmount,
                                2
                            ) }}
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

    <div class="status-box">

        <table class="meta-table">
            <tr>
                <td>
                    <div class="meta-label">
                        Quotation Status
                    </div>

                    <div class="meta-value">
                        {{ $statusLabel }}
                    </div>
                </td>

                <td>
                    <div class="meta-label">
                        Reference
                    </div>

                    <div class="meta-value">
                        #{{ $quotationNumber }}
                    </div>
                </td>

                <td>
                    <div class="meta-label">
                        Final Amount
                    </div>

                    <div class="meta-value">
                        {{ $currency }}
                        {{ number_format(
                            (float) $finalAmount,
                            2
                        ) }}
                    </div>
                </td>
            </tr>
        </table>

    </div>

    @if($quotation->message)
        <div class="note-box">

            <div class="note-title">
                Customer Message
            </div>

            <div class="note-text">
                {{ $quotation->message }}
            </div>

        </div>
    @endif

    @if($quotation->admin_note)
        <div class="note-box">

            <div class="note-title">
                Business Note
            </div>

            <div class="note-text">
                {{ $quotation->admin_note }}
            </div>

        </div>
    @endif

    <div class="footer">

        <div class="thank-you">
            Thank you for your interest.
        </div>

        This quotation was generated automatically by
        {{ $business->business_name ?? 'ShopSphere' }}.

    </div>

</div>

</body>
</html>