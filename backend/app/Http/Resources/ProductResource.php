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
            $averageRating = round(
                (float) $this->approvedReviews->avg('rating'),
                1
            );
        }

        return [
            'id' => $this->id,

            /*
            |--------------------------------------------------------------------------
            | Category
            |--------------------------------------------------------------------------
            |
            | A product belongs to ONE subcategory.
            |
            | The subcategory itself belongs to a main category.
            |
            */

            'category_id' => $this->category_id,

            'category' => new CategoryResource(
                $this->whenLoaded('category')
            ),

            /*
            |--------------------------------------------------------------------------
            | Product information
            |--------------------------------------------------------------------------
            */

            'name' => $this->name,

            'slug' => $this->slug,

            'brand' => $this->brand,

            'description' => $this->description,

            /*
            |--------------------------------------------------------------------------
            | Pricing
            |--------------------------------------------------------------------------
            */

            'price' => $this->price,

            'discount_price' => $this->discount_price,

            'effective_price' => $this->effectivePrice(),

            /*
            |--------------------------------------------------------------------------
            | Inventory
            |--------------------------------------------------------------------------
            */

            'stock_qty' => $this->stock_qty,

            'status' => $this->status->value,

            /*
            |--------------------------------------------------------------------------
            | Product details
            |--------------------------------------------------------------------------
            */

            'specifications' => $this->specifications,

            'warranty_months' => $this->warranty_months,

            'sku' => $this->sku,

            /*
            |--------------------------------------------------------------------------
            | Reviews
            |--------------------------------------------------------------------------
            */

            'average_rating' => $averageRating,

            'review_count' => $this->whenCounted(
                'approvedReviews'
            ),

            /*
            |--------------------------------------------------------------------------
            | Images
            |--------------------------------------------------------------------------
            */

            'images' => ProductImageResource::collection(
                $this->whenLoaded('images')
            ),

            /*
            |--------------------------------------------------------------------------
            | Variants
            |--------------------------------------------------------------------------
            */

            'variants' => ProductVariantResource::collection(
                $this->whenLoaded('variants')
            ),

            /*
            |--------------------------------------------------------------------------
            | Timestamps
            |--------------------------------------------------------------------------
            */

            'created_at' => $this->created_at,
        ];
    }
}