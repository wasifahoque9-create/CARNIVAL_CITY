<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'name' => $this->name,

            'email' => $this->email,

            'phone' => $this->phone,

            /*
             * UserRole enum value.
             *
             * Example:
             * customer
             * admin
             */
            'role' => $this->role?->value,

            /*
             * Google account connection.
             *
             * Can be null for normal email/password users.
             */
            'google_id' => $this->google_id,

            /*
             * True only when the user has explicitly created
             * an account password.
             */
            'password_set' => (bool) $this->password_set,

            /*
             * Convenient authentication state for frontend.
             */
            'authentication' => [
                'google' => ! empty($this->google_id),

                'password' => (bool) $this->password_set,

                'needs_password_setup' =>
                    ! (bool) $this->password_set,
            ],

            /*
             * Verification information.
             */
            'email_verified_at' => $this->email_verified_at,

            'phone_verified_at' => $this->phone_verified_at,

            /*
             * User addresses.
             *
             * Only returned when addresses are loaded.
             */
            'addresses' => AddressResource::collection(
                $this->whenLoaded('addresses')
            ),

            'created_at' => $this->created_at,

            'updated_at' => $this->updated_at,
        ];
    }
}