<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\User\ChangePasswordRequest;
use App\Http\Requests\Api\User\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('addresses')),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->safe()->only(['name', 'email', 'phone']));

        if ($request->has('addresses')) {
            foreach ($request->input('addresses', []) as $addressData) {
                if (! empty($addressData['id'])) {
                    $address = Address::query()
                        ->where('user_id', $user->id)
                        ->findOrFail($addressData['id']);
                    $address->update(collect($addressData)->except('id')->toArray());
                } else {
                    $user->addresses()->create($addressData);
                }
            }

            if ($user->addresses()->where('is_default', true)->doesntExist()) {
                $user->addresses()->first()?->update(['is_default' => true]);
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => new UserResource($user->fresh('addresses')),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['password' => $request->string('password')]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Password changed successfully. Please login again.']);
    }
}
