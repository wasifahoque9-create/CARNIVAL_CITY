<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CartResolver
{
    public function resolve(Request $request): Cart
    {
        /*
         * Check whether the request belongs to
         * a logged-in Sanctum user.
         */
        $user = Auth::guard('sanctum')->user();

        if ($user) {
            return Cart::firstOrCreate([
                'user_id' => $user->id,
            ]);
        }

        /*
         * No logged-in user = guest customer.
         */
        $guestToken = $request->header('X-Guest-Token');

        if (! $guestToken) {
            throw ValidationException::withMessages([
                'guest_token' => [
                    'Guest token is required.',
                ],
            ]);
        }

        /*
         * Prevent invalid/oversized tokens.
         */
        if (strlen($guestToken) > 100) {
            throw ValidationException::withMessages([
                'guest_token' => [
                    'Invalid guest token.',
                ],
            ]);
        }

        /*
         * Find the existing guest cart,
         * or create one for this browser.
         */
        return Cart::firstOrCreate(
            [
                'guest_token' => $guestToken,
            ],
            [
                'user_id' => null,
            ],
        );
    }
}