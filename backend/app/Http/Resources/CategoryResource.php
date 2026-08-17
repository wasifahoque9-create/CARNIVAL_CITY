<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imageUrl = $this->getCategoryImageUrl();

        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type,
            'image_url' => $imageUrl,
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at,
        ];
    }

    private function getCategoryImageUrl(): ?string
    {
        /*
         |--------------------------------------------------------------------------
         | Fixed homepage category images
         |--------------------------------------------------------------------------
         | These are real files from your storage/app/public/products folder.
         | This fixes wrong random category images on homepage.
         */

        $categoryImages = [
            // Laptop image
            'laptops' => 'products/WhatsApp Image 2026-06-29 at 1.00.34 AM.jpeg',

            // Desktop / PC image
            'desktop-pcs' => 'products/0LBVPj94Pc2p6XCHgT2qxhSIDZtve2l8YXq4D5br.jpg',

            // Tablet image
            'tablets' => 'products/OL8So2oUgZP7XQ2pGoNaZqw7Ehg2H9tfak9Qk18p.jpg',

            // Earbuds image
            'earbuds' => 'products/dY1zlqHKIvlFGZoydMtR7wEtVa1ZeoNNcYiYI7hW.jpg',

            // Mobile phone image
            'mobile-phones' => 'products/images (5).jpg.jpeg',

            // Accessory image
            // Change this filename later if you want another accessory photo.
            'accessories' => 'products/WhatsApp Image 2026-06-29 at 12.54.01 AM.jpeg',
        ];

        if (isset($categoryImages[$this->slug])) {
            return $this->buildStorageUrl($categoryImages[$this->slug]);
        }

        /*
         |--------------------------------------------------------------------------
         | Fallback: use first product image
         |--------------------------------------------------------------------------
         | If a new category is added later, it will still try to find product image.
         */

        $product = Product::query()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->where('category_id', $this->id)
                    ->orWhereHas('categories', function ($categoryQuery) {
                        $categoryQuery->where('categories.id', $this->id);
                    });
            })
            ->with(['images' => function ($query) {
                $query->orderByDesc('is_primary')->orderBy('id');
            }])
            ->first();

        if (! $product || ! $product->images->first()) {
            return null;
        }

        return $this->buildStorageUrl($product->images->first()->image_path);
    }

    private function buildStorageUrl(string $path): string
    {
        return rtrim(config('app.url'), '/') . '/storage/' . ltrim($path, '/');
    }
}