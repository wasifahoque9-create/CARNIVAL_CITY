<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Route::bind('product', function (string $value) {
            return Product::query()
                ->where('slug', $value)
                ->orWhere('id', $value)
                ->firstOrFail();
        });

        ResetPassword::createUrlUsing(function (User $user, string $token) {
            $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

            return $frontend.'/reset-password?token='.$token.'&email='.urlencode($user->email);
        });
    }
}
