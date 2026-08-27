<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    /**
     * Human-friendly name.
     *
     * Backend value "confirmed"
     * will be shown as "Accepted"
     * to admin/customer.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Accepted',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Customer may cancel only before shipment.
     */
    public function canBeCancelledByCustomer(): bool
    {
        return in_array(
            $this,
            [
                self::Pending,
                self::Confirmed,
            ],
            true
        );
    }

    /**
     * Used when admin wants to cancel.
     */
    public function isPreShipment(): bool
    {
        return in_array(
            $this,
            [
                self::Pending,
                self::Confirmed,
            ],
            true
        );
    }

    /**
     * Valid next statuses for admin.
     */
    public function allowedNextStatuses(): array
    {
        return match ($this) {
            self::Pending => [
                self::Confirmed,
                self::Cancelled,
            ],

            self::Confirmed => [
                self::Shipped,
                self::Cancelled,
            ],

            self::Shipped => [
                self::Delivered,
            ],

            self::Delivered,
            self::Cancelled => [],
        };
    }

    /**
     * Check whether transition is allowed.
     */
    public function canTransitionTo(
        self $status
    ): bool {
        return in_array(
            $status,
            $this->allowedNextStatuses(),
            true
        );
    }
}