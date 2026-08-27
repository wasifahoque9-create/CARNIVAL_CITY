<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuotationRequest extends Model
{
    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'company_name',
        'message',
        'estimated_total',
        'status',
        'quoted_amount',
        'admin_note',
    ];

    protected function casts(): array
    {
        return [
            'estimated_total' => 'decimal:2',
            'quoted_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(
            QuotationRequestItem::class
        );
    }
}