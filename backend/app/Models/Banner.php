<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'tag',
        'title',
        'highlight',
        'description',
        'price',
        'discount_text',
        'cta_text',
        'cta_link',
        'secondary_cta_text',
        'secondary_cta_link',
        'image_path',
        'fallback_emoji',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
