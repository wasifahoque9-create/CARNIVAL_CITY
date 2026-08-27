<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessSetting extends Model
{
    protected $fillable = [
        'business_name',
        'business_email',
        'business_phone',
        'whatsapp_country_code',
        'whatsapp_number',
        'business_address',
        'currency',
        'facebook_url',
        'instagram_url',
    ];
}