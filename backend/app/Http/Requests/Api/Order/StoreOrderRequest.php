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
        /*
        |--------------------------------------------------------------------------
        | Detect Logged-in / Guest Customer
        |--------------------------------------------------------------------------
        |
        | /orders route public রাখা হয়েছে যাতে guest checkout কাজ করে।
        | কিন্তু Authorization Bearer token থাকলে Sanctum দিয়ে logged-in
        | customer detect করা হবে।
        |
        */

        $user = $this->user('sanctum');

        $isGuest = $user === null;

        /*
        |--------------------------------------------------------------------------
        | Delivery Method
        |--------------------------------------------------------------------------
        */

        $deliveryMethod = (string) $this->input(
            'delivery_method',
            'home_delivery'
        );

        $isHomeDelivery =
            $deliveryMethod === 'home_delivery';

        return [
            /*
            |--------------------------------------------------------------------------
            | Delivery Method
            |--------------------------------------------------------------------------
            */

            'delivery_method' => [
                'required',
                Rule::in([
                    'home_delivery',
                    'pickup',
                ]),
            ],

            /*
            |--------------------------------------------------------------------------
            | Logged-in Customer Shipping Address
            |--------------------------------------------------------------------------
            |
            | Logged-in + Home Delivery:
            | address required.
            |
            | Logged-in + Pickup:
            | address not required.
            |
            */

            'shipping_address_id' => [
                Rule::requiredIf(
                    ! $isGuest &&
                    $isHomeDelivery
                ),

                'nullable',
                'integer',
                'exists:addresses,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Guest Customer Information
            |--------------------------------------------------------------------------
            |
            | Guest customer-এর জন্য Name, Email, Phone সবসময় required।
            |
            | Guest + Home Delivery
            | Guest + Pickup
            |
            | দুই ক্ষেত্রেই customer information লাগবে।
            |
            */

            'guest_name' => [
                Rule::requiredIf(
                    $isGuest
                ),

                'nullable',
                'string',
                'max:150',
            ],

            'guest_email' => [
                Rule::requiredIf(
                    $isGuest
                ),

                'nullable',
                'email',
                'max:190',
            ],

            'guest_phone' => [
                Rule::requiredIf(
                    $isGuest
                ),

                'nullable',
                'string',
                'max:50',
            ],

            /*
            |--------------------------------------------------------------------------
            | Guest Home Delivery Address
            |--------------------------------------------------------------------------
            |
            | Guest + Home Delivery:
            | address required.
            |
            | Guest + Pickup:
            | address not required.
            |
            */

            'guest_address_line1' => [
                Rule::requiredIf(
                    $isGuest &&
                    $isHomeDelivery
                ),

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
                Rule::requiredIf(
                    $isGuest &&
                    $isHomeDelivery
                ),

                'nullable',
                'string',
                'max:120',
            ],

            'guest_postal_code' => [
                Rule::requiredIf(
                    $isGuest &&
                    $isHomeDelivery
                ),

                'nullable',
                'string',
                'max:40',
            ],

            'guest_country' => [
                Rule::requiredIf(
                    $isGuest &&
                    $isHomeDelivery
                ),

                'nullable',
                'string',
                'max:100',
            ],

            /*
            |--------------------------------------------------------------------------
            | Payment
            |--------------------------------------------------------------------------
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