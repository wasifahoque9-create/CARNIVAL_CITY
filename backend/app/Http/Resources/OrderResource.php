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

            'shipping_address_id' => $this->shipping_address_id,

            // Guest customer information
            'guest_name' => $this->guest_name,
            'guest_phone' => $this->guest_phone,
            'guest_email' => $this->guest_email,

            // Guest delivery information
            'guest_address_line1' => $this->guest_address_line1,
            'guest_address_line2' => $this->guest_address_line2,
            'guest_city' => $this->guest_city,
            'guest_area' => $this->guest_area,
            'guest_postal_code' => $this->guest_postal_code,
            'guest_notes' => $this->guest_notes,

            'customer_type' => $this->user_id
                ? 'registered'
                : 'guest',

            'shipping_address' => new AddressResource(
                $this->whenLoaded('shippingAddress')
            ),

            'items' => OrderItemResource::collection(
                $this->whenLoaded('items')
            ),

            'payment' => new PaymentResource(
                $this->whenLoaded('payment')
            ),

            'user' => new UserResource(
                $this->whenLoaded('user')
            ),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}