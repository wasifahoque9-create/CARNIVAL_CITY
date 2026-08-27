<?php

namespace App\Http\Requests\Api\Order;

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
        $isGuest = $this->user() === null;

        return [
            /*
             * Logged-in customer:
             * must select one of their saved addresses.
             *
             * Guest customer:
             * shipping_address_id is not required.
             */
            'shipping_address_id' => [
                Rule::requiredIf(! $isGuest),
                'nullable',
                'integer',
                'exists:addresses,id',
            ],

            /*
             * Guest customer information
             */
            'guest_name' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:150',
            ],

            'guest_email' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'email',
                'max:190',
            ],

            'guest_phone' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:50',
            ],

            /*
             * Guest delivery address
             */
            'guest_address_line1' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:255',
            ],

            'guest_address_line2' => [
                'nullable',
                'string',
                'max:255',
            ],

            'guest_city' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:120',
            ],

            'guest_postal_code' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:40',
            ],

            'guest_country' => [
                Rule::requiredIf($isGuest),
                'nullable',
                'string',
                'max:100',
            ],

            /*
             * Payment
             */
            'payment_method' => [
                'required',
                Rule::in([
                    'cod',
                    'gateway',
                ]),
            ],

            'gateway_payload' => [
                'nullable',
                'array',
            ],
        ];
    }
}