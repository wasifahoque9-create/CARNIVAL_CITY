<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'user_id' => $this->user_id,

            'status' => $this->status->value,

            'total_amount' => $this->total_amount,

            /*
            |--------------------------------------------------------------------------
            | Delivery
            |--------------------------------------------------------------------------
            */

            'delivery_method' =>
                $this->delivery_method,

            'delivery_charge' =>
                $this->delivery_charge,

            /*
            |--------------------------------------------------------------------------
            | Shipping Address
            |--------------------------------------------------------------------------
            */

            'shipping_address_id' =>
                $this->shipping_address_id,

            'shipping_address' =>
                new AddressResource(
                    $this->whenLoaded(
                        'shippingAddress'
                    )
                ),

            /*
            |--------------------------------------------------------------------------
            | Guest Customer Information
            |--------------------------------------------------------------------------
            */

            'guest_name' =>
                $this->guest_name,

            'guest_email' =>
                $this->guest_email,

            'guest_phone' =>
                $this->guest_phone,

            'guest_address_line1' =>
                $this->guest_address_line1,

            'guest_address_line2' =>
                $this->guest_address_line2,

            'guest_city' =>
                $this->guest_city,

            'guest_postal_code' =>
                $this->guest_postal_code,

            'guest_country' =>
                $this->guest_country,

            /*
            |--------------------------------------------------------------------------
            | Relations
            |--------------------------------------------------------------------------
            */

            'items' =>
                OrderItemResource::collection(
                    $this->whenLoaded(
                        'items'
                    )
                ),

            'payment' =>
                new PaymentResource(
                    $this->whenLoaded(
                        'payment'
                    )
                ),

            'user' =>
                new UserResource(
                    $this->whenLoaded(
                        'user'
                    )
                ),

            /*
            |--------------------------------------------------------------------------
            | Timestamps
            |--------------------------------------------------------------------------
            */

            'created_at' =>
                $this->created_at,

            'updated_at' =>
                $this->updated_at,
        ];
    }
}