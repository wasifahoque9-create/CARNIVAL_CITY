<?php

namespace App\Http\Requests\Api\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_address_id' => ['required', 'integer', 'exists:addresses,id'],
            'payment_method' => ['required', Rule::in(['cod', 'gateway'])],
            'gateway_payload' => ['nullable', 'array'],
        ];
    }
}
