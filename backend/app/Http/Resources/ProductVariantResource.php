<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'variant_name' => $this->variant_name,
            'variant_value' => $this->variant_value,
            'price_adjustment' => $this->price_adjustment,
            'stock_qty' => $this->stock_qty,
            'sku' => $this->sku,
        ];
    }
}
