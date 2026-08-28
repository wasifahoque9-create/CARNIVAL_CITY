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

        /*
        |--------------------------------------------------------------------------
        | Delivery Tracking
        |--------------------------------------------------------------------------
        */

        'delivery_person_name',
        'delivery_person_phone',
        'tracking_number',
        'delivery_status',
        'delivery_note',
        'delivery_updated_at',

        /*
        |--------------------------------------------------------------------------
        | Guest Customer Information
        |--------------------------------------------------------------------------
        */

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

            /*
            |--------------------------------------------------------------------------
            | Delivery Tracking
            |--------------------------------------------------------------------------
            */

            'delivery_updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | User
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Shipping Address
    |--------------------------------------------------------------------------
    */

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(
            Address::class,
            'shipping_address_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Order Items
    |--------------------------------------------------------------------------
    */

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Payment
    |--------------------------------------------------------------------------
    */

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}