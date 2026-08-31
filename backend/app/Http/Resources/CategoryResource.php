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

            /*
             * Category image.
             *
             * Returns the complete public URL when an image
             * exists, otherwise returns null.
             *
             * The frontend will keep the image area blank
             * when this value is null.
             */
            'image_url' => $this->getCategoryImageUrl(),

            /*
             * Child categories are included only when the
             * controller has loaded the "children" relationship.
             */
            'children' => CategoryResource::collection(
                $this->whenLoaded('children')
            ),

            'created_at' => $this->created_at,
        ];
    }

    /**
     * Get the public URL of the category image.
     */
    private function getCategoryImageUrl(): ?string
    {
        /*
         * No image has been uploaded.
         */
        if (! $this->image_path) {
            return null;
        }

        /*
         * If the database already contains a complete URL,
         * return it directly.
         */
        if (
            str_starts_with($this->image_path, 'http://') ||
            str_starts_with($this->image_path, 'https://')
        ) {
            return $this->image_path;
        }

        /*
         * Build the public Laravel storage URL.
         *
         * Example:
         *
         * categories/laptop.jpg
         *
         * becomes:
         *
         * http://localhost:8000/storage/categories/laptop.jpg
         */
        return rtrim(config('app.url'), '/')
            . '/storage/'
            . ltrim($this->image_path, '/');
    }
}