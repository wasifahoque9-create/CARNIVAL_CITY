<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    /**
     * Get the effective selling price.
     */
    public function effectivePrice(): float
    {
        return (float) ($this->discount_price ?? $this->price);
    }

    /**
     * Product belongs to one category.
     *
     * In our system this should be a subcategory.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Product images.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id');
    }

    /**
     * Product variants.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    /**
     * All product reviews.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id');
    }

    /**
     * Approved product reviews.
     */
    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id')
            ->where('status', 'approved');
    }

    /**
     * Primary product image.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class, 'product_id')
            ->where('is_primary', true);
    }
}