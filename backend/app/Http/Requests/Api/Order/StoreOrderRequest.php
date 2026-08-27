<?php

namespace App\Http\Requests\Api\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = Auth::guard('sanctum')->user();

        $isGuest = $user === null;

        return [
            'shipping_address_id' => [
                Rule::requiredIf(! $isGuest),
                'nullable',
                'integer',
                'exists:addresses,id',
            ],

            'guest_name' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:255',
            ],

            'guest_phone' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:30',
            ],

            'guest_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'guest_address_line1' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:500',
            ],

            'guest_address_line2' => [
                'nullable',
                'string',
                'max:500',
            ],

            'guest_city' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:100',
            ],

            'guest_area' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:100',
            ],

            'guest_postal_code' => [
                'nullable',
                'string',
                'max:20',
            ],

            'guest_notes' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'payment_method' => [
                'required',
                Rule::in(['cod', 'gateway']),
            ],

            'gateway_payload' => [
                'nullable',
                'array',
            ],
        ];
    }
}