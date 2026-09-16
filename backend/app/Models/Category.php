<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'image_path',
    ];

    /**
     * The parent category.
     *
     * NULL parent_id = main category.
     * Non-NULL parent_id = subcategory.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'parent_id'
        );
    }

    /**
     * Direct child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(
            Category::class,
            'parent_id'
        );
    }

    /**
     * Subcategories of this category.
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(
            Category::class,
            'parent_id'
        );
    }

    /**
     * Products directly assigned to this category.
     *
     * Products should normally be assigned
     * to subcategories.
     */
    public function products(): HasMany
    {
        return $this->hasMany(
            Product::class,
            'category_id'
        );
    }

    /**
     * Check whether this is a main category.
     */
    public function isMainCategory(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Check whether this is a subcategory.
     */
    public function isSubcategory(): bool
    {
        return !is_null($this->parent_id);
    }
}