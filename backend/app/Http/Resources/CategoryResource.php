<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the category into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image_url' => $this->getCategoryImageUrl(),

            /*
             * Main categories return their subcategories.
             *
             * This is the field used by:
             * - Products by Category
             * - Add Product
             * - Edit Product
             */
            'subcategories' => CategoryResource::collection(
                $this->whenLoaded('subcategories')
            ),

            /*
             * Keep children available for compatibility
             * with any existing frontend code.
             *
             * Both represent the direct child categories.
             */
            'children' => CategoryResource::collection(
                $this->whenLoaded('children')
            ),

            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get the full category image URL.
     */
    private function getCategoryImageUrl(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        if (
            str_starts_with($this->image_path, 'http://') ||
            str_starts_with($this->image_path, 'https://')
        ) {
            return $this->image_path;
        }

        return rtrim(config('app.url'), '/')
            . '/storage/'
            . ltrim($this->image_path, '/');
    }
}