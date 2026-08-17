<?php

namespace App\Enums;

enum ReviewStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Hidden = 'hidden';
}
