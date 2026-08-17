<?php

namespace App\Enums;

enum CategoryType: string
{
    case Laptop = 'laptop';
    case Pc = 'pc';
    case Desktop = 'desktop';
    case Mobile = 'mobile';
    case Earbuds = 'earbuds';
    case Accessory = 'accessory';
}
