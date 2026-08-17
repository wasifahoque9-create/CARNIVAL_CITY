<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->product;

        if ($product) {
            $product->loadMissing([
                'category',
                'categories',
                'images',
                'primaryImage',
            ]);
        }

        $lineTotal = method_exists($this->resource, 'lineTotal')
            ? $this->lineTotal()
            : (float) $this->unit_price * (int) $this->quantity;

        return [
            'id' => $this->id,
            'cart_id' => $this->cart_id,
            'product_id' => $this->product_id,
            'product_variant_id' => $this->product_variant_id,
            'variant_id' => $this->product_variant_id,
            'quantity' => (int) $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => $lineTotal,
            'product' => $product ? new ProductResource($product) : null,
            'variant' => $this->whenLoaded('variant', function () {
                return new ProductVariantResource($this->variant);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
