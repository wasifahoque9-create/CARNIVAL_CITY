<?php

// app/Models/Otp.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $fillable = ['email', 'code', 'expires_at', 'used'];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];
}

