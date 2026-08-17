<?php

namespace App\Enums;

enum UserRole: string
{
    case Guest = 'guest';
    case Customer = 'customer';
    case Admin = 'admin';

    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }
}
