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
            'shipping_address' => new AddressResource($this->whenLoaded('shippingAddress')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
