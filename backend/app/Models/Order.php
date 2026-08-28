<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'total_amount',
        'shipping_address_id',

        'delivery_method',
        'delivery_charge',

        'guest_name',
        'guest_email',
        'guest_phone',
        'guest_address_line1',
        'guest_address_line2',
        'guest_city',
        'guest_postal_code',
        'guest_country',
        'guest_token',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'delivery_charge' => 'decimal:2',
            'status' => OrderStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(
            Address::class,
            'shipping_address_id'
        );
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}