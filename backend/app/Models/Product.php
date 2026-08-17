<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'brand',
        'description',
        'price',
        'discount_price',
        'stock_qty',
        'status',
        'specifications',
        'warranty_months',
        'sku',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'specifications' => 'array',
            'status' => ProductStatus::class,
        ];
    }

    public function effectivePrice(): float
    {
        return (float) ($this->discount_price ?? $this->price);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_product');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }
 

public function primaryImage(): HasOne
{
    return $this->hasOne(ProductImage::class)
        ->where('is_primary', true);
}
}
