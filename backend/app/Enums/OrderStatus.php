<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function canBeCancelledByCustomer(): bool
    {
        return in_array($this, [self::Pending, self::Confirmed], true);
    }

    public function isPreShipment(): bool
    {
        return in_array($this, [self::Pending, self::Confirmed], true);
    }
}
