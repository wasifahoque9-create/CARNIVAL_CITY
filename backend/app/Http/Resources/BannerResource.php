<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tag' => $this->tag,
            'title' => $this->title,
            'highlight' => $this->highlight,
            'description' => $this->description,
            'price' => $this->price !== null ? (float) $this->price : null,
            'discount_text' => $this->discount_text,
            'cta_text' => $this->cta_text,
            'cta_link' => $this->cta_link,
            'secondary_cta_text' => $this->secondary_cta_text,
            'secondary_cta_link' => $this->secondary_cta_link,
            // Raw relative path, same convention as ProductImageResource.
            // The frontend builds the full URL via STORAGE_BASE (see lib/api.ts -> getBannerImage).
            'image_path' => $this->image_path,
            'fallback_emoji' => $this->fallback_emoji,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
