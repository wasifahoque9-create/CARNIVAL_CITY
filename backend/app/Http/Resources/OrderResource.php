<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /*
        |--------------------------------------------------------------------------
        | Customer Information
        |--------------------------------------------------------------------------
        */

        $isRegistered = !is_null($this->user_id);

        $customerName = $isRegistered
            ? ($this->user?->name ?? 'Registered Customer')
            : ($this->guest_name ?? 'Guest Customer');

        $customerEmail = $isRegistered
            ? ($this->user?->email ?? null)
            : $this->guest_email;

        return [
            /*
            |--------------------------------------------------------------------------
            | Basic Order Information
            |--------------------------------------------------------------------------
            */

            'id' => $this->id,

            'user_id' => $this->user_id,

            /*
            |--------------------------------------------------------------------------
            | Customer Summary
            |--------------------------------------------------------------------------
            */

            'customer_name' => $customerName,

            'customer_email' => $customerEmail,

            'customer_type' => $isRegistered
                ? 'registered'
                : 'guest',

            /*
            |--------------------------------------------------------------------------
            | Order Status
            |--------------------------------------------------------------------------
            */

            'status' => $this->status->value,

            /*
            |--------------------------------------------------------------------------
            | Order Total
            |--------------------------------------------------------------------------
            */

            'total_amount' => $this->total_amount,

            /*
            |--------------------------------------------------------------------------
            | Delivery
            |--------------------------------------------------------------------------
            */

            'delivery_method' => $this->delivery_method,

            'delivery_charge' => $this->delivery_charge,

            /*
            |--------------------------------------------------------------------------
            | Delivery Tracking
            |--------------------------------------------------------------------------
            */

            'delivery_person_name' =>
                $this->delivery_person_name,

            'delivery_person_phone' =>
                $this->delivery_person_phone,

            'tracking_number' =>
                $this->tracking_number,

            'delivery_status' =>
                $this->delivery_status,

            'delivery_note' =>
                $this->delivery_note,

            'delivery_updated_at' =>
                $this->delivery_updated_at,

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