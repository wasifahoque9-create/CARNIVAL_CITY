<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    /**
     * Stub payment gateway — simulates success/failure for online payments.
     *
     * @param  array<string, mixed>  $payload
     * @return array{success: bool, transaction_ref: string|null, message: string|null}
     */
    public function processPayment(Order $order, float $amount, array $payload = []): array
    {
        $simulateFailure = (bool) ($payload['simulate_failure'] ?? false);

        if ($simulateFailure) {
            return [
                'success' => false,
                'transaction_ref' => null,
                'message' => 'Payment was declined by the gateway.',
            ];
        }

        return [
            'success' => true,
            'transaction_ref' => 'GW-'.Str::upper(Str::random(12)),
            'message' => null,
        ];
    }
}
