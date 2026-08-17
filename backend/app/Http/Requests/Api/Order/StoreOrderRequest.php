<?php

namespace App\Http\Requests\Api\Order;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
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
