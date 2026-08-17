<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $averageRating = null;
        if ($this->relationLoaded('approvedReviews')) {
            $averageRating = round((float) $this->approvedReviews->avg('rating'), 1);
        }

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => $this->brand,
            'description' => $this->description,
            'price' => $this->price,
            'discount_price' => $this->discount_price,
            'effective_price' => $this->effectivePrice(),
            'stock_qty' => $this->stock_qty,
            'status' => $this->status->value,
            'specifications' => $this->specifications,
            'warranty_months' => $this->warranty_months,
            'sku' => $this->sku,
            'average_rating' => $averageRating,
            'review_count' => $this->whenCounted('approvedReviews'),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'created_at' => $this->created_at,
        ];
    }
}
