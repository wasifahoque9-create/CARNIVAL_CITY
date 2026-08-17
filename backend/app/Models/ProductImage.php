<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'image_path',
        'alt_text',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'url',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute(): string
    {
        if (! $this->image_path) {
            return '';
        }

        $imagePath = trim($this->image_path);

        if (preg_match('/^https?:\/\//i', $imagePath)) {
            return $imagePath;
        }

        return rtrim(config('app.url'), '/') . '/storage/' . ltrim($imagePath, '/');
    }
}
