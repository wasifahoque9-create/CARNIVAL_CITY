<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type,

            /*
             * Category image uploaded from the admin panel.
             *
             * Example:
             * categories/laptop.jpg
             *
             * becomes:
             * http://localhost:8000/storage/categories/laptop.jpg
             */
            'image_url' => $this->getCategoryImageUrl(),

            'children' => CategoryResource::collection(
                $this->whenLoaded('children')
            ),

            'created_at' => $this->created_at,
        ];
    }

    private function getCategoryImageUrl(): ?string
    {
        /*
         * If this category does not have an uploaded image,
         * return null.
         *
         * The frontend will then show its existing emoji
         * fallback.
         */
        if (! $this->image_path) {
            return null;
        }

        /*
         * If image_path already contains a complete URL,
         * return it directly.
         */
        if (
            str_starts_with($this->image_path, 'http://') ||
            str_starts_with($this->image_path, 'https://')
        ) {
            return $this->image_path;
        }

        return $this->buildStorageUrl($this->image_path);
    }

    private function buildStorageUrl(string $path): string
    {
        return rtrim(config('app.url'), '/')
            . '/storage/'
            . ltrim($path, '/');
    }
}